import { useEffect, useRef, useState } from "react";
import MarkdownWrapper from "./MarkdownWrapper";
import ImagePreviewModal from "./ImagePreviewModal";
import VoiceMessageDisplay from "./VoiceMessageDisplay"; // Add this import

export default function ChatWindow({
    messages,
    isBotTyping,
    hasLoaded,
    user,
    isStreaming,
    onCancelStream,
}) {
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);

    // State for image preview modal
    const [previewImage, setPreviewImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isClosingModal = useRef(false);

    const positionAtBottomInstant = () => {
        if (isModalOpen || isClosingModal.current) return;
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
        }
    };

    const scrollToBottomSmooth = () => {
        if (isModalOpen || isClosingModal.current) return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isModalOpen || isClosingModal.current) return;

        const messagesIncreased =
            messages.length > previousMessagesLength.current;

        if (isNewConversation.current && messages.length > 0) {
            positionAtBottomInstant();
            isNewConversation.current = false;
        } else if (isBotTyping || messagesIncreased || isStreaming) {
            setTimeout(() => {
                if (!isModalOpen && !isClosingModal.current) {
                    scrollToBottomSmooth();
                }
            }, 10);
        }

        previousMessagesLength.current = messages.length;
    }, [messages, isBotTyping, isStreaming]);

    useEffect(() => {
        if (
            messages.length === 0 ||
            (previousMessagesLength.current > 0 &&
                messages.length !== previousMessagesLength.current + 1)
        ) {
            isNewConversation.current = true;
        }
    }, [messages]);

    const AvatarInside = ({ user }) => {
        const initial =
            user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A";
        return (
            <div className="w-6 h-6 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-xs font-semibold mr-2 flex-shrink-0">
                {initial.toUpperCase()}
            </div>
        );
    };

    const ImageDisplay = ({
        imageUrl,
        alt = "User uploaded image",
        scrollOnLoad = true,
    }) => {
        const handleImageClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setPreviewImage({ url: imageUrl, alt });
            setIsModalOpen(true);
        };

        return (
            <div className="mt-2 max-w-md">
                <img
                    src={imageUrl}
                    alt={alt}
                    className="rounded-lg max-w-full h-auto shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    style={{ maxHeight: "400px" }}
                    onClick={handleImageClick}
                    onError={(e) => {
                        e.target.style.display = "none";
                        console.error("Failed to load image:", imageUrl);
                    }}
                    onLoad={() => {
                        if (scrollOnLoad && !isModalOpen) {
                            scrollToBottomSmooth();
                        }
                    }}
                />
            </div>
        );
    };

    const closeModal = () => {
        isClosingModal.current = true;
        setIsModalOpen(false);
        setPreviewImage(null);

        setTimeout(() => {
            isClosingModal.current = false;
        }, 500);
    };

    return (
        <>
            <div
                ref={scrollAreaRef}
                className="flex-1 overflow-y-auto bg-white"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-4">
                        <div className="text-center max-w-2xl">
                            <h1 className="text-3xl font-light text-gray-800 mb-4">
                                Hello! How can I assist you today?
                            </h1>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        <div className="space-y-6">
                            {messages.map((message, index) => {
                                const isUser = message.sender === "user";
                                const isLastMessage =
                                    index === messages.length - 1;
                                const isStreamingMessage =
                                    isLastMessage && !isUser && isStreaming;

                                return (
                                    <div
                                        key={
                                            message.tempId ||
                                            message.id ||
                                            index
                                        }
                                        className="flex justify-start"
                                    >
                                        {isUser ? (
                                            <div>
                                                {/* Check if this is a voice message */}
                                                {message.isVoiceMessage ? (
                                                    <VoiceMessageDisplay
                                                        message={message}
                                                        isUser={true}
                                                    />
                                                ) : (
                                                    <>
                                                        {/* Display image if present */}
                                                        {message.image && (
                                                            <div className="mb-2">
                                                                <ImageDisplay
                                                                    imageUrl={
                                                                        message.image
                                                                    }
                                                                    scrollOnLoad={
                                                                        true
                                                                    }
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Display multiple files if present */}
                                                        {message.files &&
                                                            message.files
                                                                .length > 0 && (
                                                                <div className="mb-2 space-y-2">
                                                                    {message.files.map(
                                                                        (
                                                                            file,
                                                                            fileIndex
                                                                        ) => (
                                                                            <ImageDisplay
                                                                                key={
                                                                                    fileIndex
                                                                                }
                                                                                imageUrl={
                                                                                    file.url ||
                                                                                    file
                                                                                }
                                                                                alt={
                                                                                    file.name ||
                                                                                    `Image ${
                                                                                        fileIndex +
                                                                                        1
                                                                                    }`
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}

                                                        {/* Regular text message bubble */}
                                                        <div className="inline-flex items-center bg-[#1a1a1a] text-white rounded-2xl px-3 py-3 max-w-full shadow-md">
                                                            <AvatarInside
                                                                user={user}
                                                            />
                                                            <span className="ml-2 break-words whitespace-pre-wrap text-sm">
                                                                {
                                                                    message.content
                                                                }
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="max-w-[90%] pl-2">
                                                <div className="relative">
                                                    {/* Add streaming indicator and cancel button for streaming messages */}
                                                    {isStreamingMessage && (
                                                        <div className="absolute -top-8 left-0 flex items-center gap-2">
                                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                                <div className="flex space-x-0.5">
                                                                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                                                                    <div
                                                                        className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                                                                        style={{
                                                                            animationDelay:
                                                                                "0.2s",
                                                                        }}
                                                                    ></div>
                                                                    <div
                                                                        className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                                                                        style={{
                                                                            animationDelay:
                                                                                "0.4s",
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                                <span>
                                                                    Generating...
                                                                </span>
                                                            </div>
                                                            {onCancelStream && (
                                                                <button
                                                                    onClick={
                                                                        onCancelStream
                                                                    }
                                                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full transition-colors duration-200 flex items-center gap-1"
                                                                    title="Cancel response generation"
                                                                >
                                                                    <svg
                                                                        className="w-2.5 h-2.5"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M6 18L18 6M6 6l12 12"
                                                                        />
                                                                    </svg>
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`relative ${
                                                            isStreamingMessage
                                                                ? "mt-4"
                                                                : ""
                                                        }`}
                                                    >
                                                        {/* Add visual indicator for streaming messages */}
                                                        <div
                                                            className={`${
                                                                isStreamingMessage
                                                                    ? "animate-pulse border-l-2 border-blue-400 pl-3"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <MarkdownWrapper
                                                                key={`${
                                                                    message.tempId ||
                                                                    message.id ||
                                                                    index
                                                                }-${
                                                                    message
                                                                        .content
                                                                        ?.length ||
                                                                    0
                                                                }`}
                                                                content={
                                                                    message.content
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Show typing indicator only when not streaming */}
                            {isBotTyping && !isStreaming && (
                                <div className="max-w-[90%] flex flex-col pl-9">
                                    <div className="flex space-x-1 mt-2">
                                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.1s" }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Global streaming status with cancel option */}
                            {isStreaming &&
                                messages.length > 0 &&
                                !messages[messages.length - 1]?.content && (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                    <div
                                                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                                        style={{
                                                            animationDelay:
                                                                "0.2s",
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                                                        style={{
                                                            animationDelay:
                                                                "0.4s",
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm text-blue-700 font-medium">
                                                    Preparing response...
                                                </span>
                                            </div>
                                            {onCancelStream && (
                                                <button
                                                    onClick={onCancelStream}
                                                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                                                >
                                                    <svg
                                                        className="w-3 h-3"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
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
