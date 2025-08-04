import {
    createConversation,
    streamFromBackend,
    sendVoiceMessage,
    streamWebSearch,
} from "../controllers/chat";

export default function useMessageHandler(chatState) {
    console.log("🔧 useMessageHandler initialized");

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

    const cancelCurrentStream = () => {
        console.log("🛑 cancelCurrentStream called");
        if (activeStreamRef.current) {
            console.log(
                "🛑 Cancelling active stream:",
                activeStreamRef.current
            );
            activeStreamRef.current.cancelled = true;
            setIsStreaming(false);
            setIsBotTyping(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);

            if (streamingTimeoutRef.current) {
                console.log("⏰ Clearing streaming timeout");
                clearTimeout(streamingTimeoutRef.current);
                streamingTimeoutRef.current = null;
            }

            setMessages((prev) => {
                console.log("📝 Adding cancellation message");
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

            activeStreamRef.current = null;
        } else {
            console.log("🛑 No active stream to cancel");
        }
    };

    const handleSend = async (text, files = [], options = {}) => {
        console.log("🚀 handleSend called:", {
            text: text?.substring(0, 100) + "...",
            filesCount: files.length,
            options,
            currentStates: {
                isProcessingMessage,
                isLoadingInput,
                isStreaming,
                canSendNewMessage,
            },
        });

        const { webSearchEnabled = false } = options;

        // Prevent multiple simultaneous sends
        if (isProcessingMessage || isLoadingInput) {
            console.log(
                "⚠️ Already processing a message, ignoring new send request"
            );
            return;
        }

        // Cancel existing stream if running
        if (isStreaming || !canSendNewMessage) {
            console.log(
                "🛑 Cancelling existing stream before sending new message"
            );
            cancelCurrentStream();
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        console.log("🔄 Setting initial processing states");
        // Set processing states
        setIsProcessingMessage(true);
        setIsLoadingInput(true);
        setCanSendNewMessage(false);
        setShouldReloadAfterStream(false);

        console.log("🖼️ Creating temp image URLs:", files);
        // Create stable temp image URLs
        const tempImageUrls = createTempImageUrls(files);
        const tempMessageId = `temp-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: tempMessageId,
            status: "pending",
            files: tempImageUrls,
        };

        console.log("📤 Created temp user message:", {
            tempMessageId,
            filesCount: tempImageUrls.length,
            tempImageUrls,
        });

        // Add user message immediately
        setMessages((prev) => {
            console.log(
                "📝 Adding user message to state, previous length:",
                prev.length
            );
            const newMessages = [...prev, tempUserMessage];
            console.log("📝 New messages length:", newMessages.length);
            return newMessages;
        });

        try {
            let currentChatId = chatId;
            console.log("💬 Current chat ID:", currentChatId);

            // Handle new conversation creation
            if (
                !currentChatId ||
                currentChatId === "undefined" ||
                currentChatId === "new"
            ) {
                console.log("🆕 Creating new conversation");
                const newChat = await createConversation(userId, text, files);
                currentChatId = newChat.id;
                console.log("✅ New conversation created:", currentChatId);
                setChatId(newChat.id);
                skipNextLoadRef.current = newChat.id;
                navigate(`/chat/${newChat.id}`, { replace: true });
            }

            // Create stream tracker
            const streamTracker = {
                chatId: currentChatId,
                cancelled: false,
                messageId: tempMessageId,
            };
            activeStreamRef.current = streamTracker;
            console.log("📊 Stream tracker created:", streamTracker);

            // Set initial streaming states
            console.log("🔄 Setting streaming states");
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let botMessageId = null;
            let isFirstChunk = true;
            setIsStreaming(true);

            // Handle streaming function
            const handleStreamChunk = (chunk) => {
                console.log("📦 Stream chunk received:", {
                    chunkLength: chunk.length,
                    chunkPreview: chunk.substring(0, 50) + "...",
                    cancelled: streamTracker.cancelled,
                    currentChatMatches:
                        currentChatIdRef.current === currentChatId,
                    botMessageId,
                });

                if (
                    streamTracker.cancelled ||
                    currentChatIdRef.current !== currentChatId
                ) {
                    console.log(
                        "🛑 Stream cancelled or chat changed, ignoring chunk"
                    );
                    return;
                }

                if (isFirstChunk) {
                    console.log(
                        "🎬 First chunk received, stopping typing indicator"
                    );
                    setIsBotTyping(false);
                    isFirstChunk = false;
                }

                // Clear previous timeout
                if (streamingTimeoutRef.current) {
                    console.log("⏰ Clearing previous streaming timeout");
                    clearTimeout(streamingTimeoutRef.current);
                }

                // Set new timeout for reload
                streamingTimeoutRef.current = setTimeout(() => {
                    console.log("⏰ Setting shouldReloadAfterStream to true");
                    setShouldReloadAfterStream(true);
                }, 3000);

                // Update messages with batching to prevent excessive renders
                setMessages((prev) => {
                    console.log(
                        "📝 Updating messages with chunk, previous length:",
                        prev.length
                    );
                    const updated = [...prev];
                    const botIndex = updated.findIndex(
                        (msg) => msg.tempId === botMessageId
                    );

                    if (botIndex !== -1) {
                        console.log(
                            "✏️ Updating existing bot message at index:",
                            botIndex
                        );
                        // Update existing bot message
                        updated[botIndex] = {
                            ...updated[botIndex],
                            content: updated[botIndex].content + chunk,
                        };
                    } else {
                        // Create new bot message
                        botMessageId = `bot-${Date.now()}-${Math.random()
                            .toString(36)
                            .substr(2, 9)}`;
                        console.log(
                            "🆕 Creating new bot message:",
                            botMessageId
                        );
                        updated.push({
                            sender: "bot",
                            content: chunk,
                            timestamp: new Date().toISOString(),
                            tempId: botMessageId,
                            source: webSearchEnabled ? "websearch" : "chat",
                        });
                    }

                    console.log("📝 Updated messages length:", updated.length);
                    return updated;
                });
            };

            // Handle completion
            const handleStreamComplete = async () => {
                console.log("🏁 Stream completion handler called:", {
                    cancelled: streamTracker.cancelled,
                    currentChatMatches:
                        currentChatIdRef.current === currentChatId,
                });

                if (
                    !streamTracker.cancelled &&
                    currentChatIdRef.current === currentChatId
                ) {
                    console.log("✅ Stream completed successfully");
                    setIsStreaming(false);
                    setCanSendNewMessage(true);
                    setIsProcessingMessage(false);

                    // Update user message status
                    setMessages((prev) => {
                        console.log(
                            "📝 Updating user message status to delivered"
                        );
                        return prev.map((msg) =>
                            msg.tempId === tempMessageId
                                ? { ...msg, status: "delivered" }
                                : msg
                        );
                    });

                    // Refresh conversation list
                    try {
                        console.log("🔄 Refreshing conversation list");
                        await refreshConversationList();
                        console.log("✅ Conversation list refreshed");
                    } catch (refreshError) {
                        console.error(
                            "❌ Error refreshing conversation list:",
                            refreshError
                        );
                    }
                } else {
                    console.log(
                        "🛑 Stream completion skipped due to cancellation or chat change"
                    );
                }
            };

            // Execute appropriate streaming function
            if (webSearchEnabled) {
                console.log("🔍 Starting web search stream");
                try {
                    await streamWebSearch(
                        currentChatId,
                        text,
                        handleStreamChunk
                    );
                    await handleStreamComplete();
                } catch (err) {
                    console.error("❌ Web search stream error:", err);
                    throw new Error(`Web search failed: ${err.message}`);
                }
            } else {
                console.log("💬 Starting regular chat stream");
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
                    console.error("❌ Chat stream error:", err);
                    throw new Error(`Chat stream failed: ${err.message}`);
                }
            }
        } catch (err) {
            console.error("💥 Error in handleSend:", err);
            console.log("🔄 Resetting states due to error");

            // Reset states
            setShouldReloadAfterStream(false);
            setIsStreaming(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);
            setIsBotTyping(false);
            setIsLoadingInput(false);

            // Update user message with error
            setMessages((prev) => {
                console.log("📝 Updating user message with error status");
                return prev.map((msg) =>
                    msg.tempId === tempMessageId
                        ? { ...msg, status: "failed", error: err.message }
                        : msg
                );
            });

            // Add error message
            setMessages((prev) => {
                console.log("📝 Adding error message to chat");
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
            console.log("🧹 Cleaning up temporary image URLs");
            tempImageUrls.forEach((file, index) => {
                console.log(`🧹 Cleaning up temp URL ${index}:`, file);
                if (
                    file.isTemporary &&
                    file.url &&
                    file.url.startsWith("blob:")
                ) {
                    try {
                        URL.revokeObjectURL(file.url);
                        console.log("✅ Blob URL revoked successfully");
                    } catch (revokeError) {
                        console.error(
                            "❌ Error revoking blob URL:",
                            revokeError
                        );
                    }
                }
            });
        } finally {
            console.log("🔄 Finally block - ensuring all states are reset");
            // Ensure all states are reset
            setIsBotTyping(false);
            setIsLoadingInput(false);
            setIsStreaming(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);
            activeStreamRef.current = null;

            // Clear any remaining timeouts
            if (streamingTimeoutRef.current) {
                console.log("🧹 Clearing remaining streaming timeout");
                clearTimeout(streamingTimeoutRef.current);
                streamingTimeoutRef.current = null;
            }

            console.log("✅ handleSend completed");
        }
    };

    const handleVoiceMessage = async (audioBlob) => {
        console.log("🎤 handleVoiceMessage called:", {
            audioBlobSize: audioBlob?.size,
            currentStates: {
                isTranscribing,
                isProcessingMessage,
                isLoadingInput,
            },
        });

        if (isTranscribing || isProcessingMessage || isLoadingInput) {
            console.log(
                "⚠️ Voice transcription already in progress or system busy"
            );
            return;
        }

        console.log("🔄 Starting voice transcription");
        setIsTranscribing(true);

        try {
            console.log("📤 Sending voice message for transcription");
            const result = await sendVoiceMessage(
                null,
                userId,
                audioBlob,
                null
            );
            console.log("📥 Transcription result received:", result);

            if (result.success && result.transcribedText) {
                console.log(
                    "✅ Setting transcribed text:",
                    result.transcribedText
                );
                setTranscribedText(result.transcribedText);
            } else {
                console.error("❌ No transcribed text received in result");
                throw new Error("No transcribed text received");
            }
        } catch (err) {
            console.error("💥 Error transcribing voice message:", err);
            setMessages((prev) => {
                console.log("📝 Adding voice transcription error message");
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
            console.log(
                "🔄 Voice transcription completed, resetting isTranscribing"
            );
            setIsTranscribing(false);
        }
    };

    console.log("✅ useMessageHandler setup complete");

    return {
        handleSend,
        handleVoiceMessage,
        cancelCurrentStream,
    };
}
