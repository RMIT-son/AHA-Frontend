import { useEffect } from "react";

export default function useCleanupEffects({
    activeStreamRef,
    streamingTimeoutRef,
    chatId,
    setIsStreaming,
    setIsBotTyping,
    setCanSendNewMessage,
    setIsProcessingMessage,
    messages,
}) {
    // Cleanup active streams when component unmounts or chat changes
    useEffect(() => {
        return () => {
            if (activeStreamRef.current) {
                activeStreamRef.current.cancelled = true;
            }
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
            }
        };
    }, []);

    // Cancel streaming when navigating to different chat
    useEffect(() => {
        if (
            activeStreamRef.current &&
            activeStreamRef.current.chatId !== chatId
        ) {
            activeStreamRef.current.cancelled = true;
            setIsStreaming(false);
            setIsBotTyping(false);
            setCanSendNewMessage(true);
            setIsProcessingMessage(false);
        }
    }, [chatId]);

    // Cleanup temporary URLs when component unmounts
    useEffect(() => {
        return () => {
            messages.forEach((message) => {
                if (message.files) {
                    message.files.forEach((file) => {
                        if (
                            file.isTemporary &&
                            file.url &&
                            file.url.startsWith("blob:")
                        ) {
                            URL.revokeObjectURL(file.url);
                        }
                    });
                }
                if (message.audioUrl && message.audioUrl.startsWith("blob:")) {
                    URL.revokeObjectURL(message.audioUrl);
                }
            });
        };
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
            }
        };
    }, []);
}
