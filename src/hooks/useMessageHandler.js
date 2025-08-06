import {
    createConversation,
    streamFromBackend,
    sendVoiceMessage,
    streamWebSearch,
} from "../controllers/chat";

/**
 * Custom hook for handling message operations in a chat interface
 *
 * Manages the complete message lifecycle including:
 * - Sending text and file messages
 * - Handling real-time streaming responses
 * - Voice message transcription
 * - Message state management and error handling
 *
 * @param {Object} chatState - Object containing all chat-related state and setters
 * @returns {Object} Object containing message handler functions
 */
export default function useMessageHandler(chatState) {
    // Destructure all required state variables and setters from chatState
    const {
        chatId,
        setChatId,
        userId,
        messages,
        setMessages,
        isProcessingMessage,
        setIsProcessingMessage,
        isLoadingInput,
        setIsLoadingInput,
        canSendNewMessage,
        setCanSendNewMessage,
        isStreaming,
        setIsStreaming,
        isBotTyping,
        setIsBotTyping,
        setShouldReloadAfterStream,
        isTranscribing,
        setIsTranscribing,
        setTranscribedText,
        activeStreamRef,
        currentChatIdRef,
        streamingTimeoutRef,
        skipNextLoadRef,
        createTempImageUrls,
        refreshConversationList,
        navigate,
    } = chatState;

    /**
     * Cancels the currently active message stream
     *
     * Safely terminates any ongoing stream operation, resets all relevant state,
     * and adds a system message indicating the cancellation.
     */
    const cancelCurrentStream = () => {
        if (activeStreamRef.current) {
            // Mark the current stream as cancelled
            activeStreamRef.current.cancelled = true;

            // Reset all streaming-related states
            setIsStreaming(false);
            setIsBotTyping(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);

            // Clear any active streaming timeout
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
                streamingTimeoutRef.current = null;
            }

            // Add system message to inform user of cancellation
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        sender: "system",
                        content: "Message generation was cancelled.",
                        timestamp: new Date().toISOString(),
                        isInfo: true,
                        tempId: `system-${Date.now()}`,
                    },
                ];
            });

            // Clear the active stream reference
            activeStreamRef.current = null;
        }
    };

    /**
     * Handles sending a message with optional files and configurations
     *
     * Manages the complete message sending flow including:
     * - Input validation and state management
     * - Conversation creation for new chats
     * - Real-time streaming response handling
     * - Error handling and recovery
     *
     * @param {string} text - The message text content
     * @param {Array} files - Array of file objects to attach (default: empty array)
     * @param {Object} options - Configuration options including webSearchEnabled
     */
    const handleSend = async (text, files = [], options = {}) => {
        const { webSearchEnabled = false } = options;

        // Prevent multiple simultaneous message sends
        if (isProcessingMessage || isLoadingInput) {
            return;
        }

        // Cancel any existing stream before sending new message
        if (isStreaming || !canSendNewMessage) {
            cancelCurrentStream();
            // Brief delay to ensure clean state transition
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Initialize message processing states
        setIsProcessingMessage(true);
        setIsLoadingInput(true);
        setCanSendNewMessage(false);
        setShouldReloadAfterStream(false);

        // Process file attachments and create temporary URLs
        const tempImageUrls = createTempImageUrls(files);
        const tempMessageId = `temp-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        // Create temporary user message object
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: tempMessageId,
            status: "pending",
            files: tempImageUrls,
        };

        // Immediately add user message to UI for instant feedback
        setMessages((prev) => {
            const newMessages = [...prev, tempUserMessage];
            return newMessages;
        });

        try {
            let currentChatId = chatId;

            // Handle conversation creation for new chats
            if (
                !currentChatId ||
                currentChatId === "undefined" ||
                currentChatId === "new"
            ) {
                const newChat = await createConversation(userId, text, files);
                currentChatId = newChat.id;
                setChatId(newChat.id);
                skipNextLoadRef.current = newChat.id;
                navigate(`/chat/${newChat.id}`, { replace: true });
            }

            // Initialize stream tracking object
            const streamTracker = {
                chatId: currentChatId,
                cancelled: false,
                messageId: tempMessageId,
            };
            activeStreamRef.current = streamTracker;

            // Configure initial streaming states
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let botMessageId = null;
            let isFirstChunk = true;
            setIsStreaming(true);

            /**
             * Handles individual chunks of streamed response data
             *
             * @param {string} chunk - Individual piece of streamed response content
             */
            const handleStreamChunk = (chunk) => {
                // Skip processing if stream was cancelled or chat changed
                if (
                    streamTracker.cancelled ||
                    currentChatIdRef.current !== currentChatId
                ) {
                    return;
                }

                // Handle first chunk received - stop typing indicator
                if (isFirstChunk) {
                    setIsBotTyping(false);
                    isFirstChunk = false;
                }

                // Reset streaming timeout on each chunk
                if (streamingTimeoutRef.current) {
                    clearTimeout(streamingTimeoutRef.current);
                }

                // Set timeout to trigger reload after stream completion
                streamingTimeoutRef.current = setTimeout(() => {
                    setShouldReloadAfterStream(true);
                }, 3000);

                // Update message state with new chunk content
                setMessages((prev) => {
                    const updated = [...prev];
                    const botIndex = updated.findIndex(
                        (msg) => msg.tempId === botMessageId
                    );

                    if (botIndex !== -1) {
                        // Append to existing bot message
                        updated[botIndex] = {
                            ...updated[botIndex],
                            content: updated[botIndex].content + chunk,
                        };
                    } else {
                        // Create new bot message entry
                        botMessageId = `bot-${Date.now()}-${Math.random()
                            .toString(36)
                            .substr(2, 9)}`;
                        updated.push({
                            sender: "bot",
                            content: chunk,
                            timestamp: new Date().toISOString(),
                            tempId: botMessageId,
                            source: webSearchEnabled ? "websearch" : "chat",
                        });
                    }

                    return updated;
                });
            };

            /**
             * Handles completion of the message stream
             *
             * Performs cleanup, state updates, and conversation list refresh
             */
            const handleStreamComplete = async () => {
                // Only proceed if stream wasn't cancelled and chat is still active
                if (
                    !streamTracker.cancelled &&
                    currentChatIdRef.current === currentChatId
                ) {
                    // Reset streaming states
                    setIsStreaming(false);
                    setCanSendNewMessage(true);
                    setIsProcessingMessage(false);

                    // Update user message status to delivered
                    setMessages((prev) => {
                        return prev.map((msg) =>
                            msg.tempId === tempMessageId
                                ? { ...msg, status: "delivered" }
                                : msg
                        );
                    });

                    // Refresh conversation list in sidebar
                    try {
                        await refreshConversationList();
                    } catch (refreshError) {
                        console.error(
                            "❌ Error refreshing conversation list:",
                            refreshError
                        );
                    }
                }
            };

            // Execute appropriate streaming method based on configuration
            if (webSearchEnabled) {
                try {
                    await streamWebSearch(
                        currentChatId,
                        text,
                        handleStreamChunk
                    );
                    await handleStreamComplete();
                } catch (err) {
                    throw new Error(`Web search failed: ${err.message}`);
                }
            } else {
                try {
                    await streamFromBackend(
                        currentChatId,
                        userId,
                        text,
                        handleStreamChunk,
                        files
                    );
                    await handleStreamComplete();
                } catch (err) {
                    throw new Error(`Chat stream failed: ${err.message}`);
                }
            }
        } catch (err) {
            // Handle any errors during message sending process

            // Reset all streaming and processing states
            setShouldReloadAfterStream(false);
            setIsStreaming(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);
            setIsBotTyping(false);
            setIsLoadingInput(false);

            // Update user message to show failed status
            setMessages((prev) => {
                return prev.map((msg) =>
                    msg.tempId === tempMessageId
                        ? { ...msg, status: "failed", error: err.message }
                        : msg
                );
            });

            // Add system error message to chat
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        sender: "system",
                        content: webSearchEnabled
                            ? "Web search failed. Please try again."
                            : "Failed to send message. Please try again.",
                        timestamp: new Date().toISOString(),
                        isError: true,
                        tempId: `error-${Date.now()}`,
                    },
                ];
            });

            // Clean up temporary blob URLs to prevent memory leaks
            tempImageUrls.forEach((file, index) => {
                if (
                    file.isTemporary &&
                    file.url &&
                    file.url.startsWith("blob:")
                ) {
                    try {
                        URL.revokeObjectURL(file.url);
                    } catch (revokeError) {
                        console.error(
                            "❌ Error revoking blob URL:",
                            revokeError
                        );
                    }
                }
            });
        } finally {
            // Ensure all states are properly reset regardless of success/failure
            setIsBotTyping(false);
            setIsLoadingInput(false);
            setIsStreaming(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);
            activeStreamRef.current = null;

            // Clear any remaining timeouts
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
                streamingTimeoutRef.current = null;
            }
        }
    };

    /**
     * Handles voice message recording and transcription
     *
     * Processes audio blob through speech-to-text service and updates
     * the transcribed text state for use in the message input.
     *
     * @param {Blob} audioBlob - The recorded audio data as a Blob object
     */
    const handleVoiceMessage = async (audioBlob) => {
        // Prevent overlapping transcription requests
        if (isTranscribing || isProcessingMessage || isLoadingInput) {
            return;
        }

        // Set transcription state to show loading indicator
        setIsTranscribing(true);

        try {
            // Send audio blob to transcription service
            const result = await sendVoiceMessage(
                null,
                userId,
                audioBlob,
                null
            );

            // Process successful transcription result
            if (result.success && result.transcribedText) {
                setTranscribedText(result.transcribedText);
            } else {
                throw new Error("No transcribed text received");
            }
        } catch (err) {
            // Add error message to chat on transcription failure
            setMessages((prev) => {
                return [
                    ...prev,
                    {
                        sender: "system",
                        content:
                            "Failed to transcribe voice message. Please try again.",
                        timestamp: new Date().toISOString(),
                        isError: true,
                        tempId: `voice-error-${Date.now()}`,
                    },
                ];
            });
        } finally {
            // Always reset transcription state
            setIsTranscribing(false);
        }
    };

    // Return public interface of the hook
    return {
        handleSend,
        handleVoiceMessage,
        cancelCurrentStream,
    };
}
