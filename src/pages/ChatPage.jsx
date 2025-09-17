import { useState, useEffect } from "react";
import { ChatWindow, ChatInput, ChatLayout, MobileChatInput } from "../components";
import {
    useAuth,
    useChatState,
    useChatData,
    useMessageHandler,
    useCleanupEffects,
} from "../hooks";

export default function ChatPage() {
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

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

    // Enhanced send handler that includes web search options and file processing
    const handleSendWithOptions = (message, files, options = {}) => {
        const { webSearchEnabled: searchEnabled } = options;

        // Process files and separate audio files from other files
        const processedFiles = files
            ? files.map((fileData) => {
                  // Ensure we have the necessary file information
                  const processedFile = {
                      id: fileData.id || Date.now() + Math.random(),
                      file: fileData.file,
                      name: fileData.name || fileData.file?.name,
                      size: fileData.size || fileData.file?.size,
                      type: fileData.type || fileData.file?.type,
                      preview: fileData.preview,
                      isAudio:
                          fileData.isAudio ||
                          fileData.type?.startsWith("audio/"),
                  };

                  return processedFile;
              })
            : [];

        // Call the original handler with web search option and processed files
        handleSend(message, processedFiles, {
            webSearchEnabled: searchEnabled || webSearchEnabled,
        });
    };

    // Handle audio file upload for transcription
    const handleAudioFileUpload = async (audioFile) => {
        try {
            // Convert File to Blob for compatibility with handleVoiceMessage
            const audioBlob = new Blob([audioFile], { type: audioFile.type });

            // Use the existing voice message handler for transcription
            await handleVoiceMessage(audioBlob);
        } catch (error) {
            console.error(`❌ Failed to process audio file:`, error);

            // Add error message to chat
            setMessages((prev) => [
                ...prev,
                {
                    sender: "system",
                    content: `Failed to process audio file "${audioFile.name}". Please try again.`,
                    timestamp: new Date().toISOString(),
                    isError: true,
                    tempId: `audio-error-${Date.now()}`,
                },
            ]);
        }
    };

    // Toggle web search
    const handleWebSearchToggle = () => {
        setWebSearchEnabled((prev) => !prev);
    };

    // Handle transcribed text usage
    const handleTranscribedTextUsed = () => {
        setTranscribedText("");
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
                chatId={chatId}
            />
            {isMobile ? (
                <MobileChatInput
                    onSend={handleSendWithOptions}
                    onVoiceRecord={handleVoiceMessage}
                    isLoading={isLoadingInput}
                    canSend={canSendNewMessage && !isProcessingMessage}
                    isStreaming={isStreaming}
                    onCancelStream={cancelCurrentStream}
                    isProcessing={isProcessingMessage}
                    transcribedText={transcribedText}
                    onTranscribedTextUsed={handleTranscribedTextUsed}
                    isTranscribing={isTranscribing}
                    // Web search props
                    enableWebSearch={true}
                    webSearchEnabled={webSearchEnabled}
                    onWebSearchToggle={handleWebSearchToggle}
                    // Audio file upload prop
                    onAudioFileUpload={handleAudioFileUpload}
                />
            ) : (
                <ChatInput
                    onSend={handleSendWithOptions}
                    onVoiceRecord={handleVoiceMessage}
                    isLoading={isLoadingInput}
                    canSend={canSendNewMessage && !isProcessingMessage}
                    isStreaming={isStreaming}
                    onCancelStream={cancelCurrentStream}
                    isProcessing={isProcessingMessage}
                    transcribedText={transcribedText}
                    onTranscribedTextUsed={handleTranscribedTextUsed}
                    isTranscribing={isTranscribing}
                    // Web search props
                    enableWebSearch={true}
                    webSearchEnabled={webSearchEnabled}
                    onWebSearchToggle={handleWebSearchToggle}
                    // Audio file upload prop
                    onAudioFileUpload={handleAudioFileUpload}
                />
            )}
        </ChatLayout>
    );
}