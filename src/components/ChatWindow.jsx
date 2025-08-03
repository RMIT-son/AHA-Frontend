import { useEffect, useRef, useState } from "react";
import MarkdownTranslator from "./MarkdownTranslator";
import ImagePreviewModal from "./ImagePreviewModal";

export default function ChatWindow({
    messages,
    isBotTyping,
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
    const isClosingModal = useRef(false);
    const scrollingEnabled = useRef(true);
    // Track which images have already loaded to prevent re-scrolling
    const loadedImages = useRef(new Set());

    const positionAtBottomInstant = () => {
        // Additional check before scrolling
        if (!scrollingEnabled.current || isModalOpen || isClosingModal.current)
            return;
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop =
                scrollAreaRef.current.scrollHeight;
        }
    };

    const scrollToBottomSmooth = () => {
        // Additional check before scrolling
        if (!scrollingEnabled.current || isModalOpen || isClosingModal.current)
            return;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Don't scroll when modal is open or being closed
        if (!scrollingEnabled.current || isModalOpen || isClosingModal.current)
            return;

        const messagesIncreased =
            messages.length > previousMessagesLength.current;

        if (isNewConversation.current && messages.length > 0) {
            positionAtBottomInstant();
            isNewConversation.current = false;
        } else if (isBotTyping || messagesIncreased || isStreaming) {
            // Add a small delay to ensure modal state is properly set
            setTimeout(() => {
                if (
                    scrollingEnabled.current &&
                    !isModalOpen &&
                    !isClosingModal.current
                ) {
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
            // Clear loaded images cache when starting new conversation
            loadedImages.current.clear();
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
        const [imageError, setImageError] = useState(false);
        const [imageLoaded, setImageLoaded] = useState(false);

        const handleImageClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            scrollingEnabled.current = false; // Disable scrolling immediately
            setPreviewImage({ url: imageUrl, alt });
            setIsModalOpen(true);
        };

        const handleImageLoad = () => {
            setImageLoaded(true);
            // Only scroll if this image hasn't been loaded before
            if (
                scrollOnLoad &&
                !isModalOpen &&
                !isClosingModal.current &&
                !loadedImages.current.has(imageUrl)
            ) {
                loadedImages.current.add(imageUrl);
                scrollToBottomSmooth();
            }
        };

        const handleImageError = (e) => {
            console.error("Failed to load image:", imageUrl);
            setImageError(true);
        };

        // Don't render anything if there's an error
        if (imageError) {
            return (
                <div className="mt-2 max-w-md p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 text-red-600">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span className="text-sm">Failed to load image</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="mt-2 max-w-md">
                {!imageLoaded && (
                    <div
                        className="animate-pulse bg-gray-200 rounded-lg"
                        style={{ height: "200px", maxWidth: "400px" }}
                    >
                        <div className="flex items-center justify-center h-full">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
                )}
                <img
                    src={imageUrl}
                    alt={alt}
                    className={`rounded-lg max-w-full h-auto shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                        imageLoaded ? "opacity-100" : "opacity-0 absolute"
                    }`}
                    style={{ maxHeight: "400px" }}
                    onClick={handleImageClick}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                />
            </div>
        );
    };

    const closeModal = () => {
        isClosingModal.current = true;
        scrollingEnabled.current = false; // Keep scrolling disabled during close
        setIsModalOpen(false);
        setPreviewImage(null);

        // Prevent any focus-related scrolling after modal closes
        setTimeout(() => {
            // Blur any focused elements to prevent keyboard navigation scrolling
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }, 50);

        // Reset the flags after the modal has fully closed
        setTimeout(() => {
            isClosingModal.current = false;
            scrollingEnabled.current = true; // Re-enable scrolling
        }, 800); // Increased delay to ensure modal animation completes
    };

    // Helper function to extract image URL from file object
    const getImageUrl = (file) => {
        // Handle different possible data structures
        if (typeof file === "string") {
            return file; // Direct URL string
        }

        // Check for common URL properties
        return file.url || file.file || file.src || file.path || null;
    };

    // Helper function to get image name/alt text
    const getImageAlt = (file, index) => {
        if (typeof file === "string") {
            return `Image ${index + 1}`;
        }

        return file.name || file.alt || `Image ${index + 1}`;
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
                                                {/* Display single image if present */}
                                                {message.image && (
                                                    <div className="mb-2">
                                                        <ImageDisplay
                                                            imageUrl={
                                                                message.image
                                                            }
                                                            alt="User uploaded image"
                                                            scrollOnLoad={true}
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
                                                                ) => {
                                                                    const imageUrl =
                                                                        getImageUrl(
                                                                            file
                                                                        );
                                                                    const imageAlt =
                                                                        getImageAlt(
                                                                            file,
                                                                            fileIndex
                                                                        );

                                                                    // Only render if we have a valid URL
                                                                    if (
                                                                        !imageUrl
                                                                    ) {
                                                                        console.warn(
                                                                            "No valid image URL found for file:",
                                                                            file
                                                                        );
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <ImageDisplay
                                                                            key={
                                                                                fileIndex
                                                                            }
                                                                            imageUrl={
                                                                                imageUrl
                                                                            }
                                                                            alt={
                                                                                imageAlt
                                                                            }
                                                                            scrollOnLoad={
                                                                                true
                                                                            }
                                                                        />
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    )}

                                                {/* User message bubble - only show if there's content */}
                                                {message.content &&
                                                    message.content.trim() && (
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
                                                    )}
                                            </div>
                                        ) : (
                                            <div className="max-w-[90%] pl-2">
                                                <div className="relative">
                                                    <div className="relative text-gray-800">
                                                        <MarkdownTranslator
                                                            content={
                                                                message.content
                                                            }
                                                            className="text-sm leading-relaxed"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Bot typing indicator */}
                            {isBotTyping && !isStreaming && (
                                <div className="max-w-[90%] pl-2">
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
