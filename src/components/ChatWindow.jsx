import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {ImagePreviewModal, BotMessage ,UserMessage, TypingIndicator, EmptyState } from "./ChatWindow/index.js";
import { useScrolling } from "../hooks/userScrolling";

export default function ChatWindow({
    messages,
    isBotTyping,
    user,
    isStreaming,
}) {
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);
    const lastBotMessageRef = useRef(null);
    const loadedImages = useRef(new Set());

    // State for image preview modal
    const [previewImage, setPreviewImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Use custom scrolling hook
    const {
        messagesEndRef,
        scrollAreaRef,
        scrollingEnabled,
        isClosingModal,
        positionAtBottomInstant,
        scrollToBottomSmooth
    } = useScrolling(isModalOpen, isStreaming);

    // Speaker handler function
    const handleSpeaker = useCallback((message, messageIndex) => {
        // Add your speaker logic here
        console.log(`Speaker clicked for message at index ${messageIndex}:`, message);
    }, []);

    // Image handling functions
    const handleImageClick = useCallback((imageData) => {
        scrollingEnabled.current = false;
        setPreviewImage(imageData);
        setIsModalOpen(true);
    }, []);

    const handleImageLoad = useCallback(() => {
        setTimeout(() => {
            if (scrollingEnabled.current && !isModalOpen && !isClosingModal.current) {
                scrollToBottomSmooth();
            }
        }, 50);
    }, [scrollToBottomSmooth, isModalOpen]);

    const closeModal = useCallback(() => {
        isClosingModal.current = true;
        scrollingEnabled.current = false;
        setIsModalOpen(false);
        setPreviewImage(null);

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
        if (typeof file === "string") return file;
        return file?.url || file?.file || file?.src || file?.path || null;
    }, []);

    const getImageAlt = useCallback((file, index) => {
        return typeof file === "string"
            ? `Image ${index + 1}`
            : file?.name || file?.alt || `Image ${index + 1}`;
    }, []);

    // Main scroll effect
    useEffect(() => {
        if (!scrollingEnabled.current || isModalOpen || isClosingModal.current) {
            return;
        }

        const messagesIncreased = messages.length > previousMessagesLength.current;

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
        const botMessages = messages.filter(msg => msg.sender === "bot" || msg.sender === "system");
        if (botMessages.length > 0) {
            const latestBotMessage = botMessages[botMessages.length - 1];
            
            if (!lastBotMessageRef.current || lastBotMessageRef.current.tempId !== latestBotMessage.tempId) {
                lastBotMessageRef.current = latestBotMessage;
            }
        }
    }, [messages]);

    // Memoize the messages rendering
    const renderedMessages = useMemo(() => {
        return messages.map((message, index) => {
            const isUser = message.sender === "user";
            const isBotMessage = message.sender === "bot" || message.sender === "system";
            const messageKey = message.tempId || message.id || `msg-${index}`;
            
            // Determine if this bot message should have streaming effect
            const shouldStream = isBotMessage && 
                                 message.shouldStream &&
                                 !message.streamingComplete &&
                                 message.content && 
                                 message.content.trim().length > 0;

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
                        onImageLoad={handleImageLoad}
                        loadedImages={loadedImages}
                    />
                );
            } else {
                return (
                    <BotMessage
                        key={messageKey}
                        message={message}
                        index={index}
                        shouldStream={shouldStream}
                        handleSpeaker={handleSpeaker}
                    />
                );
            }
        });
    }, [
        messages,
        user,
        handleSpeaker,
        getImageUrl,
        getImageAlt,
        handleImageClick,
        handleImageLoad,
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
                            {isBotTyping && !isStreaming && <TypingIndicator />}
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