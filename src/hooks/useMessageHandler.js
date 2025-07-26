import {
    createConversation,
    streamFromBackend,
    sendVoiceMessage,
} from "../controllers/chat";

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

    const cancelCurrentStream = () => {
        if (activeStreamRef.current) {
            activeStreamRef.current.cancelled = true;
            setIsStreaming(false);
            setIsBotTyping(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);

            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
                streamingTimeoutRef.current = null;
            }

            setMessages((prev) => [
                ...prev,
                {
                    sender: "system",
                    content: "Message generation was cancelled.",
                    timestamp: new Date().toISOString(),
                    isInfo: true,
                },
            ]);

            activeStreamRef.current = null;
        }
    };

    const handleSend = async (text, files = []) => {
        if (isProcessingMessage || isLoadingInput) return;

        if (isStreaming || !canSendNewMessage) {
            cancelCurrentStream();
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        setIsProcessingMessage(true);
        setIsLoadingInput(true);
        setCanSendNewMessage(false);
        setShouldReloadAfterStream(false);

        const tempImageUrls = createTempImageUrls(files);
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(),
            status: "pending",
            files: tempImageUrls,
        };

        try {
            let currentChatId = chatId;

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

            const streamTracker = { chatId: currentChatId, cancelled: false };
            activeStreamRef.current = streamTracker;

            setMessages((prev) => [...prev, tempUserMessage]);
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let botMessageId = null;
            let isFirstChunk = true;
            setIsStreaming(true);

            await streamFromBackend(
                currentChatId,
                userId,
                text,
                (chunk) => {
                    if (
                        streamTracker.cancelled ||
                        currentChatIdRef.current !== currentChatId
                    ) {
                        console.log(
                            "Stream cancelled or chat changed, ignoring chunk"
                        );
                        return;
                    }

                    if (isFirstChunk) {
                        setIsBotTyping(false);
                        isFirstChunk = false;
                    }

                    if (streamingTimeoutRef.current) {
                        clearTimeout(streamingTimeoutRef.current);
                    }

                    streamingTimeoutRef.current = setTimeout(() => {
                        setShouldReloadAfterStream(true);
                    }, 2000);

                    setMessages((prev) => {
                        const updated = [...prev];
                        const botIndex = updated.findIndex(
                            (msg) => msg.tempId === botMessageId
                        );
                        if (botIndex !== -1) {
                            const updatedMsg = {
                                ...updated[botIndex],
                                content: updated[botIndex].content + chunk,
                            };
                            updated[botIndex] = updatedMsg;
                        } else {
                            botMessageId = Date.now();
                            updated.push({
                                sender: "bot",
                                content: chunk,
                                timestamp: new Date().toISOString(),
                                tempId: botMessageId,
                            });
                        }
                        return updated;
                    });
                },
                files
            );

            if (
                !streamTracker.cancelled &&
                currentChatIdRef.current === currentChatId
            ) {
                setIsStreaming(false);
                setCanSendNewMessage(true);
                setIsProcessingMessage(false);

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.tempId === tempUserMessage.tempId
                            ? { ...msg, status: "delivered" }
                            : msg
                    )
                );

                await refreshConversationList();
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setShouldReloadAfterStream(false);
            setIsStreaming(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === tempUserMessage.tempId
                        ? { ...msg, status: "failed", error: err.message }
                        : msg
                )
            );

            setMessages((prev) => [
                ...prev,
                {
                    sender: "system",
                    content: "Failed to send message. Please try again.",
                    timestamp: new Date().toISOString(),
                    isError: true,
                },
            ]);

            tempImageUrls.forEach((file) => {
                if (
                    file.isTemporary &&
                    file.url &&
                    file.url.startsWith("blob:")
                ) {
                    URL.revokeObjectURL(file.url);
                }
            });
        } finally {
            setIsBotTyping(false);
            setIsLoadingInput(false);
            setIsStreaming(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);
            activeStreamRef.current = null;
        }
    };

    const handleVoiceMessage = async (audioBlob) => {
        if (isTranscribing || isProcessingMessage || isLoadingInput) return;

        setIsTranscribing(true);

        try {
            console.log("Starting voice transcription...");
            const result = await sendVoiceMessage(
                null,
                userId,
                audioBlob,
                null
            );
            console.log("Transcription result:", result);

            if (result.success && result.transcribedText) {
                setTranscribedText(result.transcribedText);
                console.log("Transcribed text set:", result.transcribedText);
            } else {
                throw new Error("No transcribed text received");
            }
        } catch (err) {
            console.error("Error transcribing voice message:", err);
            setMessages((prev) => [
                ...prev,
                {
                    sender: "system",
                    content:
                        "Failed to transcribe voice message. Please try again.",
                    timestamp: new Date().toISOString(),
                    isError: true,
                },
            ]);
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
