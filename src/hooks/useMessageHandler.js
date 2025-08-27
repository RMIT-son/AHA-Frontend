import {
    createConversation,
    sendMessageToBackend,
    sendVoiceMessage,
    sendWebSearchRequest,
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

        // Set processing states
        setIsProcessingMessage(true);
        setIsLoadingInput(true);
        setCanSendNewMessage(false);
        setShouldReloadAfterStream(false);

        // Create stable temp image URLs
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

        // Add user message immediately
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

            // Create stream tracker for cancellation support
            const streamTracker = {
                chatId: currentChatId,
                cancelled: false,
                messageId: tempMessageId,
            };
            activeStreamRef.current = streamTracker;

            // Set loading states
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let response;

            // Execute appropriate function based on options
            if (webSearchEnabled) {
                response = await sendWebSearchRequest(currentChatId, text);
            } else {
                response = await sendMessageToBackend(
                    currentChatId,
                    userId,
                    text,
                    files
                );
            }

            // Check if request was cancelled during processing
            if (
                streamTracker.cancelled ||
                currentChatIdRef.current !== currentChatId
            ) {
                return;
            }

            if (response.success && response.response) {
                // Create bot message with complete response
                const botMessageId = `bot-${Date.now()}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;

                // Stop typing indicator
                setIsBotTyping(false);

                // Add bot message with complete response - streaming will be handled by MarkdownTranslator
                setMessages((prev) => {
                    const updated = [...prev];
                    updated.push({
                        sender: "bot",
                        content: response.response,
                        timestamp: new Date().toISOString(),
                        tempId: botMessageId,
                        source: webSearchEnabled ? "websearch" : "chat",
                        shouldStream: true, // Flag to indicate this message should stream
                        streamingComplete: false,
                    });
                    return updated;
                });

                // Mark streaming as complete after the animation duration
                const estimatedStreamingTime = Math.max(3000, (response.response.length / 15) * 1000);
                
                streamingTimeoutRef.current = setTimeout(() => {
                    setMessages((prev) => {
                        return prev.map((msg) =>
                            msg.tempId === botMessageId
                                ? { ...msg, streamingComplete: true, shouldStream: false }
                                : msg
                        );
                    });
                }, estimatedStreamingTime);

                // Update user message status to delivered
                setMessages((prev) => {
                    return prev.map((msg) =>
                        msg.tempId === tempMessageId
                            ? { ...msg, status: "delivered" }
                            : msg
                    );
                });

                // Reset states
                setIsStreaming(false);
                setCanSendNewMessage(true);
                setIsProcessingMessage(false);

                // Refresh conversation list
                try {
                    await refreshConversationList();
                } catch (refreshError) {
                    // Handle refresh error silently
                }
            } else {
                throw new Error("No response received from backend");
            }

        } catch (err) {
            // Reset states on error
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

            // Clean up temporary image URLs
            tempImageUrls.forEach((file, index) => {
                if (
                    file.isTemporary &&
                    file.url &&
                    file.url.startsWith("blob:")
                ) {
                    try {
                        URL.revokeObjectURL(file.url);
                    } catch (revokeError) {
                        // Handle silently
                    }
                }
            });
        } finally {
            // Ensure all states are reset
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
        if (isTranscribing || isProcessingMessage || isLoadingInput) {
            return;
        }

        setIsTranscribing(true);

        try {
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
            setIsTranscribing(false);
        }
    };

    return {
        handleSend,
        handleVoiceMessage,
        cancelCurrentStream,
    };
}