import { useState } from "react";
import { ChatWindow, ChatInput, ChatLayout } from "../components";
import {
    useAuth,
    useChatState,
    useChatData,
    useMessageHandler,
    useCleanupEffects,
} from "../hooks";

export default function ChatPage() {
    // Web search state
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);

    const chatState = useChatState();
    const {
        userId,
        setUserId,
        user,
        setUser,
        chatId,
        messages,
        chatRooms,
        isBotTyping,
        isLoadingInput, 
        hasLoaded,
        isStreaming,
        canSendNewMessage,
        isProcessingMessage,
        transcribedText,
        setTranscribedText,
        isTranscribing,
        skipNextLoadRef,
        activeStreamRef,
        streamingTimeoutRef,
        navigate,
        id,
        setChatId,
        setMessages,
        validateMessageOrder,
        refreshConversationList,
        setHasLoaded,
        getCurrentChatTitle,
    } = chatState;

    // Custom hooks for different concerns
    useAuth(navigate, setUserId, setUser);

    useChatData({
        id,
        userId,
        skipNextLoadRef,
        setChatId,
        setMessages,
        validateMessageOrder,
        refreshConversationList,
        setHasLoaded,
    });

    const { handleSend, handleVoiceMessage, cancelCurrentStream } =
        useMessageHandler(chatState);

    useCleanupEffects({
        activeStreamRef,
        streamingTimeoutRef,
        chatId,
        setIsStreaming: chatState.setIsStreaming,
        setIsBotTyping: chatState.setIsBotTyping,
        setCanSendNewMessage: chatState.setCanSendNewMessage,
        setIsProcessingMessage: chatState.setIsProcessingMessage,
        messages,
    });

    // Enhanced send handler that includes web search options
    const handleSendWithOptions = (message, files, options = {}) => {
        const { webSearchEnabled: searchEnabled } = options;

        // Log file details for debugging
        if (files && files.length > 0) {
            // File processing details can be logged here if needed
        }

        // Call the original handler with web search option
        handleSend(message, files, {
            webSearchEnabled: searchEnabled || webSearchEnabled,
        });
    };

    // Toggle web search
    const handleWebSearchToggle = () => {
        setWebSearchEnabled((prev) => !prev);
    };

    return (
        <ChatLayout
            activeRoomId={chatId}
            headerTitle={getCurrentChatTitle()}
            chatRooms={chatRooms}
            user={user}
            onChatRoomsUpdate={refreshConversationList}
        >
            <ChatWindow
                messages={messages}
                isBotTyping={isBotTyping}
                hasLoaded={hasLoaded}
                user={user}
                isStreaming={isStreaming}
                onCancelStream={cancelCurrentStream}
            />
            <ChatInput
                onSend={handleSendWithOptions}
                onVoiceRecord={handleVoiceMessage}
                isLoading={isLoadingInput}
                canSend={canSendNewMessage && !isProcessingMessage}
                isStreaming={isStreaming}
                onCancelStream={cancelCurrentStream}
                isProcessing={isProcessingMessage}
                transcribedText={transcribedText}
                onTranscribedTextUsed={() => {
                    setTranscribedText("");
                }}
                isTranscribing={isTranscribing}
                // Web search props
                enableWebSearch={true}
                webSearchEnabled={webSearchEnabled}
                onWebSearchToggle={handleWebSearchToggle}
            />
        </ChatLayout>
    );
}