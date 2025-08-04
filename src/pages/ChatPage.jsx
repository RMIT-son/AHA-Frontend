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
    console.log("🏠 ChatPage render started");

    // Web search state
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);

    console.log("🔧 Initializing chat state");
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

    console.log("📊 ChatPage state:", {
        userId,
        chatId,
        messagesCount: messages.length,
        isBotTyping,
        isLoadingInput,
        hasLoaded,
        isStreaming,
        canSendNewMessage,
        isProcessingMessage,
        isTranscribing,
        webSearchEnabled,
    });

    // Custom hooks for different concerns
    console.log("🔐 Initializing useAuth");
    useAuth(navigate, setUserId, setUser);

    console.log("📚 Initializing useChatData");
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

    console.log("💬 Initializing useMessageHandler");
    const { handleSend, handleVoiceMessage, cancelCurrentStream } =
        useMessageHandler(chatState);

    console.log("🧹 Initializing useCleanupEffects");
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
        console.log("📤 handleSendWithOptions called:", {
            messageLength: message?.length,
            filesCount: files?.length,
            options,
            webSearchEnabled,
        });

        const { webSearchEnabled: searchEnabled } = options;

        console.log("🔍 Processing send options:", {
            searchEnabled,
            globalWebSearchEnabled: webSearchEnabled,
            finalSearchEnabled: searchEnabled || webSearchEnabled,
        });

        // Log file details
        if (files && files.length > 0) {
            console.log(
                "📎 Files being sent:",
                files.map((file, index) => ({
                    index,
                    type: typeof file,
                    isString: typeof file === "string",
                    hasUrl: !!file?.url,
                    hasFile: !!file?.file,
                    hasSrc: !!file?.src,
                    hasPath: !!file?.path,
                    fileName: file?.name,
                    fileSize: file?.size,
                    preview:
                        typeof file === "string"
                            ? file.substring(0, 50) + "..."
                            : "object",
                }))
            );
        }

        // Call the original handler
        console.log("🚀 Calling handleSend with processed options");
        handleSend(message, files, {
            webSearchEnabled: searchEnabled || webSearchEnabled,
        });
        console.log("✅ handleSend call completed");
    };

    // Toggle web search
    const handleWebSearchToggle = () => {
        console.log("🔄 Toggling web search:", !webSearchEnabled);
        setWebSearchEnabled((prev) => !prev);
    };

    console.log("🎨 Rendering ChatPage components");

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
                    console.log("🎤 Transcribed text used, clearing");
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
