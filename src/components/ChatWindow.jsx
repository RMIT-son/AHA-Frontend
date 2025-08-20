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
    chatId,
}) {
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
        scrollToBottomSmooth,
    } = useScrolling(isModalOpen, isStreaming);

    // Refs for tracking conversation state
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);
    const lastBotMessageRef = useRef(null);
    const loadedImages = useRef(new Set());
    const scrollTimeoutRef = useRef(null);

    // Image click handler
    const handleImageClick = useCallback(
        (imageUrl, alt) => {
            scrollingEnabled.current = false;
            setPreviewImage({ url: imageUrl, alt });
            setIsModalOpen(true);
        },
        [scrollingEnabled]
    );

    // File click handler - for non-image files
    const handleFileClick = useCallback((fileInfo) => {
        // For now, just download the file
        // You can add a file preview modal later if needed
        const link = document.createElement("a");
        link.href = fileInfo.url;
        link.download = fileInfo.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

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
        isClosingModal,
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

            if (
                !lastBotMessageRef.current ||
                lastBotMessageRef.current.tempId !== latestBotMessage.tempId
            ) {
                lastBotMessageRef.current = latestBotMessage;
            }
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0 && isNewConversation.current) {
            // Force scroll to bottom when conversation is loaded initially
            positionAtBottomInstant();
            isNewConversation.current = false;
        }
    }, [messages.length, positionAtBottomInstant]);

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

    // Memoize the messages rendering
    const renderedMessages = useMemo(() => {
        return messages.map((message, index) => {
            const isUser = index % 2 === 0;
            const isBotMessage = index % 2 !== 0;

            const shouldStream =
                isBotMessage &&
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
                        onImageClick={handleImageClick}
                        onFileClick={handleFileClick}
                    />
                );
            } else {
                return (
                    <BotMessage
                        key={messageKey}
                        message={message}
                        shouldStream={shouldStream}
                    />
                );
            }
        });
    }, [messages, user, handleImageClick, handleFileClick]);

    return (
        <>
            <div
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto bg-white"
            >
                {messages.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl  mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 md:pt-8">
                        <div className="space-y-3 sm:space-y-4 md:space-y-6">
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
