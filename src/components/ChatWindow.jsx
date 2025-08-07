import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useScrolling } from "../hooks/userScrolling";
import ImagePreviewModal from "./ChatWindow/ImagePreviewModal";
import EmptyState from "./ChatWindow/EmptyState";
import UserMessage from "./ChatWindow/UserMessage";
import BotMessage from "./ChatWindow/BotMessage";
import TypingIndicator from "./ChatWindow/TypingIndicator";

export default function ChatWindow({
    messages,
    isBotTyping,
    user,
    isStreaming,
}) {
    console.log(messages.length, "messages length in chat window");

    // State for image preview modal
    const [previewImage, setPreviewImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Custom hook for scrolling functionality
    const {
        messagesEndRef,
        scrollAreaRef,
        scrollingEnabled,
        isClosingModal,
        positionAtBottomInstant,
        scrollToBottomSmooth
    } = useScrolling(isModalOpen, isStreaming);

    // Refs for tracking conversation state
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);
    const lastBotMessageRef = useRef(null);
    const loadedImages = useRef(new Set());
    const scrollTimeoutRef = useRef(null);

    // Speaker handler function
    const handleSpeaker = useCallback((message, messageIndex) => {
        // Add your speaker logic here
    }, []);

    // Image click handler
    const handleImageClick = useCallback((imageUrl, alt) => {
        scrollingEnabled.current = false;
        setPreviewImage({ url: imageUrl, alt });
        setIsModalOpen(true);
    }, [scrollingEnabled]);

    // Main scroll effect
    useEffect(() => {
        if (
            !scrollingEnabled.current ||
            isModalOpen ||
            isClosingModal.current
        ) {
            return;
        }

        const messagesIncreased =
            messages.length > previousMessagesLength.current;

        if (isNewConversation.current && messages.length > 0) {
            positionAtBottomInstant();
            isNewConversation.current = false;
        } else if (isBotTyping || messagesIncreased || isStreaming) {
            scrollToBottomSmooth();
        }

        previousMessagesLength.current = messages.length;
    }, [
        messages.length,
        isBotTyping,
        isStreaming,
        positionAtBottomInstant,
        scrollToBottomSmooth,
        isModalOpen,
        isClosingModal
    ]);

    // Reset conversation state when needed
    useEffect(() => {
        if (
            messages.length === 0 ||
            (previousMessagesLength.current > 0 &&
                messages.length < previousMessagesLength.current)
        ) {
            isNewConversation.current = true;
            loadedImages.current.clear();
            lastBotMessageRef.current = null;
        }
    }, [messages.length]);

    // Track the latest bot message for streaming detection
    useEffect(() => {
        const botMessages = messages.filter((msg, index) => index % 2 !== 0);
        if (botMessages.length > 0) {
            const latestBotMessage = botMessages[botMessages.length - 1];
            
            if (!lastBotMessageRef.current || lastBotMessageRef.current.tempId !== latestBotMessage.tempId) {
                lastBotMessageRef.current = latestBotMessage;
            }
        }
    }, [messages]);

    // Modal close handler
    const closeModal = useCallback(() => {
        isClosingModal.current = true;
        scrollingEnabled.current = false;
        setIsModalOpen(false);
        setPreviewImage(null);

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        setTimeout(() => {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }, 50);

        setTimeout(() => {
            isClosingModal.current = false;
            scrollingEnabled.current = true;
        }, 300);
    }, []);

    // Helper functions
    const getImageUrl = useCallback((file) => {
        if (typeof file === "string") {
            return file;
        }
        return file?.url || file?.file || file?.src || file?.path || null;
    }, []);

    const getImageAlt = useCallback((file, index) => {
        return typeof file === "string"
            ? `Image ${index + 1}`
            : file?.name || file?.alt || `Image ${index + 1}`;
    }, []);

    // Memoize the messages rendering
    const renderedMessages = useMemo(() => {
        return messages.map((message, index) => {
            const isUser = index % 2 === 0;
            const isBotMessage = index % 2 !== 0;
            
            console.log(`Message ${index}: ${isUser ? 'user' : 'bot'}`);
            
            const shouldStream = isBotMessage && 
                                 message.shouldStream && 
                                 !message.streamingComplete && 
                                 message.content && 
                                 message.content.trim().length > 0;

            const messageKey = message.tempId || message.id || `msg-${index}`;

            if (isUser) {
                return (
                    <UserMessage
                        key={messageKey}
                        message={message}
                        user={user}
                        messageKey={messageKey}
                        getImageUrl={getImageUrl}
                        getImageAlt={getImageAlt}
                        onImageClick={handleImageClick}
                        scrollToBottomSmooth={scrollToBottomSmooth}
                        isModalOpen={isModalOpen}
                        isClosingModal={isClosingModal}
                        scrollingEnabled={scrollingEnabled}
                        loadedImages={loadedImages}
                    />
                );
            } else {
                return (
                    <BotMessage
                        key={messageKey}
                        message={message}
                        shouldStream={shouldStream}
                        onSpeakerClick={handleSpeaker}
                        messageIndex={index}
                    />
                );
            }
        });
    }, [
        messages,
        user,
        handleImageClick,
        scrollToBottomSmooth,
        isModalOpen,
        isClosingModal,
        scrollingEnabled,
        loadedImages,
        getImageUrl,
        getImageAlt,
        handleSpeaker,
    ]);

    return (
        <>
            <div
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto bg-white"
            >
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        <div className="space-y-6">
                            {renderedMessages}

                            {/* Bot typing indicator */}
                            {isBotTyping && !isStreaming && (
                                <TypingIndicator />
                            )}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <ImagePreviewModal
                    imageUrl={previewImage.url}
                    alt={previewImage.alt}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                />
            )}
        </>
    );
}