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
        const link = document.createElement("a");
        link.href = fileInfo.url;
        link.download = fileInfo.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    // Scroll to bottom handler
    const handleScrollToBottom = useCallback(() => {
        scrollToBottomSmooth();
        setShowScrollToBottom(false);
    }, [scrollToBottomSmooth]);

    // Monitor scroll position to show/hide scroll-to-bottom button
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
            <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-50/30 to-emerald-50/20 dark:from-neutral-900 dark:to-neutral-800 transition-all duration-300">
                {/* Subtle pattern overlay for texture */}
                <div
                    className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='37' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div
                    ref={scrollAreaRef}
                    className="h-full overflow-y-auto scroll-smooth"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "rgb(203 213 225) transparent",
                    }}
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <EmptyState />
                        </div>
                    ) : (
                        <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pt-6 sm:pt-8 md:pt-12 pb-8">
                            <div className="space-y-6 sm:space-y-8 md:space-y-10">
                                {renderedMessages}

                                {/* Enhanced bot typing indicator */}
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

                {/* Scroll to bottom button with healthcare styling */}
                {showScrollToBottom && (
                    <button
                        onClick={handleScrollToBottom}
                        className="fixed bottom-24 right-6 sm:right-8 z-20 group bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        aria-label="Scroll to bottom"
                    >
                        <svg
                            className="w-5 h-5 transition-transform group-hover:translate-y-0.5"
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
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></div>
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
                        background: rgb(203 213 225 / 0.5);
                        border-radius: 3px;
                        transition: all 0.2s;
                    }
                    .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: rgb(148 163 184 / 0.7);
                    }
                    .dark .overflow-y-auto::-webkit-scrollbar-thumb {
                        background: rgb(71 85 105 / 0.5);
                    }
                    .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                        background: rgb(100 116 139 / 0.7);
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
