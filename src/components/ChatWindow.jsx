import { useEffect, useRef, useState } from "react";
import MarkdownWrapper from "./MarkdownWrapper";
import ImagePreviewModal from "./ImagePreviewModal";

export default function ChatWindow({
    messages,
    isBotTyping,
    hasLoaded,
    user,
    isStreaming,
}) {
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);

    // State for image preview modal
    const [previewImage, setPreviewImage] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const positionAtBottomInstant = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
        }
    };

    const scrollToBottomSmooth = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const messagesIncreased =
            messages.length > previousMessagesLength.current;
        if (isNewConversation.current && messages.length > 0) {
            positionAtBottomInstant();
            isNewConversation.current = false;
        } else if (isBotTyping || messagesIncreased || isStreaming) {
            scrollToBottomSmooth();
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

    const ImageDisplay = ({ imageUrl, alt = "User uploaded image" }) => {
        const handleImageClick = () => {
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
                        scrollToBottomSmooth();
                    }}
                />
            </div>
        );
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPreviewImage(null);
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
                                                {/* Display image if present */}
                                                {message.image && (
                                                    <div className="mb-2">
                                                        <ImageDisplay
                                                            imageUrl={
                                                                message.image
                                                            }
                                                        />
                                                    </div>
                                                )}

                                                {/* Display multiple files if present */}
                                                {message.files &&
                                                    message.files.length >
                                                        0 && (
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

                                                {/* Message bubble wraps content only */}
                                                <div className="inline-flex items-center bg-[#1a1a1a] text-white rounded-2xl px-3 py-3 max-w-full shadow-md">
                                                    <AvatarInside user={user} />
                                                    <span className="ml-2 break-words whitespace-pre-wrap text-sm">
                                                        {message.content}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-w-[90%] pl-2">
                                                <div className="relative">
                                                    <div className="relative">
                                                        <MarkdownWrapper
                                                            key={`${
                                                                message.tempId ||
                                                                message.id ||
                                                                index
                                                            }-${
                                                                message.content
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
                                        )}
                                    </div>
                                );
                            })}

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
