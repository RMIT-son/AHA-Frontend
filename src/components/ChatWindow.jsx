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
    // State management
    const [previewImage, setPreviewImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    // Custom hook for scrolling functionality
    const {
        messagesEndRef,
        scrollAreaRef,
        scrollingEnabled,
        isClosingModal,
        positionAtBottomInstant,
        scrollToBottomSmooth,
    } = useScrolling(isModalOpen, isStreaming);

    // Refs for conversation state tracking
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);
    const lastBotMessageRef = useRef(null);
    const loadedImages = useRef(new Set());
    const scrollTimeoutRef = useRef(null);

    // Event handlers
    const handleImageClick = useCallback(
        (imageUrl, alt) => {
            scrollingEnabled.current = false;
            setPreviewImage({ url: imageUrl, alt });
            setIsModalOpen(true);
        },
        [scrollingEnabled]
    );

    const handleFileClick = useCallback((fileInfo) => {
        const link = document.createElement("a");
        link.href = fileInfo.url;
        link.download = fileInfo.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const handleScrollToBottom = useCallback(() => {
        scrollToBottomSmooth();
        setShowScrollToBottom(false);
    }, [scrollToBottomSmooth]);

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

    // Effects
    useEffect(() => {
        const scrollArea = scrollAreaRef.current;
        if (!scrollArea) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = scrollArea;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
            setShowScrollToBottom(!isNearBottom && messages.length > 3);
        };

        scrollArea.addEventListener("scroll", handleScroll);
        return () => scrollArea.removeEventListener("scroll", handleScroll);
    }, [messages.length]);

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

    // Message rendering
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
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-neutral-900">
                <div
                    ref={scrollAreaRef}
                    className="h-full overflow-y-auto scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState />
                        </div>
                    ) : (
                        <div className="w-full max-w-4xl mx-auto px-4 pt-8 pb-8">
                            <div className="space-y-8">
                                {renderedMessages}

                                {isBotTyping && !isStreaming && (
                                    <div className="flex justify-start">
                                        <TypingIndicator />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                {showScrollToBottom && (
                    <button
                        onClick={handleScrollToBottom}
                        className="fixed bottom-24 right-6 z-20 bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label="Scroll to bottom"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </button>
                )}

                {/* Custom scrollbar styles */}
                <style jsx>{`
                    .overflow-y-auto::-webkit-scrollbar {
                        width: 6px;
                    }
                    .overflow-y-auto::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: rgb(229 231 235 / 0.7);
                        border-radius: 3px;
                        transition: all 0.2s;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: rgb(16 185 129 / 0.5);
                    }
                    .dark .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: rgb(75 85 99 / 0.7);
                    }
                    .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: rgb(16 185 129 / 0.5);
                    }
                `}</style>
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
