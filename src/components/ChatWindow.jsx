import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

    // Debounce scroll operations to prevent excessive calls
    const scrollTimeoutRef = useRef(null);
    const lastScrollTime = useRef(0);

    const positionAtBottomInstant = useCallback(() => {
        console.log("📍 positionAtBottomInstant called:", {
            scrollingEnabled: scrollingEnabled.current,
            isModalOpen,
            isClosingModal: isClosingModal.current,
        });

        if (
            !scrollingEnabled.current ||
            isModalOpen ||
            isClosingModal.current
        ) {
            console.log("⛔ positionAtBottomInstant blocked");
            return;
        }

        if (scrollAreaRef.current) {
            const scrollHeight = scrollAreaRef.current.scrollHeight;
            console.log("📍 Setting scroll position to:", scrollHeight);
            scrollAreaRef.current.scrollTop = scrollHeight;
        }
    }, [isModalOpen]);

    const scrollToBottomSmooth = useCallback(() => {
        console.log("🔽 scrollToBottomSmooth called:", {
            scrollingEnabled: scrollingEnabled.current,
            isModalOpen,
            isClosingModal: isClosingModal.current,
        });

        if (
            !scrollingEnabled.current ||
            isModalOpen ||
            isClosingModal.current
        ) {
            console.log("⛔ scrollToBottomSmooth blocked");
            return;
        }

        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime.current;

        // Debounce scroll operations - only allow one every 100ms
        if (timeSinceLastScroll < 100) {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                scrollToBottomSmooth();
            }, 100);
            return;
        }

        lastScrollTime.current = now;

        // Use requestAnimationFrame for smoother performance
        requestAnimationFrame(() => {
            if (
                scrollingEnabled.current &&
                !isModalOpen &&
                !isClosingModal.current
            ) {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "end",
                });
            }
        });
    }, [isModalOpen]);

    // Main scroll effect with detailed logging
    useEffect(() => {
        if (
            !scrollingEnabled.current ||
            isModalOpen ||
            isClosingModal.current
        ) {
            console.log("⛔ Main scroll effect blocked");
            return;
        }

        const messagesIncreased =
            messages.length > previousMessagesLength.current;

        if (isNewConversation.current && messages.length > 0) {
            positionAtBottomInstant();
            isNewConversation.current = false;
        } else if (isBotTyping || messagesIncreased || isStreaming) {
            isStreaming, scrollToBottomSmooth();
        } else {
        }

        previousMessagesLength.current = messages.length;
    }, [
        messages.length,
        isBotTyping,
        isStreaming,
        positionAtBottomInstant,
        scrollToBottomSmooth,
    ]);

    // Reset conversation state when needed
    useEffect(() => {
        console.log("🔄 Conversation reset effect:", {
            messagesLength: messages.length,
            previousLength: previousMessagesLength.current,
        });

        if (
            messages.length === 0 ||
            (previousMessagesLength.current > 0 &&
                messages.length < previousMessagesLength.current)
        ) {
            console.log("🗑️ Resetting conversation state");
            isNewConversation.current = true;
            loadedImages.current.clear();
        }
    }, [messages.length]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Memoize AvatarInside to prevent unnecessary re-renders
    const AvatarInside = useMemo(() => {
        console.log("👤 AvatarInside memoized");
        return ({ user }) => {
            const initial =
                user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A";
            return (
                <div className="w-6 h-6 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-xs font-semibold mr-2 flex-shrink-0">
                    {initial.toUpperCase()}
                </div>
            );
        };
    }, []);

    // Optimized ImageDisplay component with debug logging
    const ImageDisplay = useCallback(
        ({
            imageUrl,
            alt = "User uploaded image",
            scrollOnLoad = true,
            messageId,
        }) => {
            console.log("🖼️ ImageDisplay render:", {
                imageUrl: imageUrl?.substring(0, 50) + "...",
                messageId,
                scrollOnLoad,
            });

            const [imageError, setImageError] = useState(false);
            const [imageLoaded, setImageLoaded] = useState(false);
            const imageRef = useRef(null);

            const handleImageClick = useCallback(
                (e) => {
                    console.log("🖱️ Image clicked:", imageUrl);
                    e.preventDefault();
                    e.stopPropagation();
                    scrollingEnabled.current = false;
                    setPreviewImage({ url: imageUrl, alt });
                    setIsModalOpen(true);
                },
                [imageUrl, alt]
            );

            const handleImageLoad = useCallback(() => {
                console.log("✅ Image loaded:", {
                    imageUrl: imageUrl?.substring(0, 50) + "...",
                    messageId,
                    scrollOnLoad,
                });

                setImageLoaded(true);

                // Create a unique key for this image
                const imageKey = `${messageId}-${imageUrl}`;

                console.log("🔑 Image load analysis:", {
                    imageKey,
                    alreadyLoaded: loadedImages.current.has(imageKey),
                    isModalOpen,
                    isClosingModal: isClosingModal.current,
                    scrollingEnabled: scrollingEnabled.current,
                });

                // Only scroll if this specific image hasn't been loaded before
                if (
                    scrollOnLoad &&
                    !isModalOpen &&
                    !isClosingModal.current &&
                    !loadedImages.current.has(imageKey) &&
                    scrollingEnabled.current
                ) {
                    console.log(
                        "📝 Adding image to loaded set and triggering scroll"
                    );
                    loadedImages.current.add(imageKey);
                    // Delay scroll to ensure image is rendered
                    setTimeout(() => {
                        console.log("⏰ Delayed scroll for image load");
                        if (
                            scrollingEnabled.current &&
                            !isModalOpen &&
                            !isClosingModal.current
                        ) {
                            scrollToBottomSmooth();
                        } else {
                            console.log("⛔ Delayed scroll cancelled");
                        }
                    }, 50);
                } else {
                    console.log("🚫 Image scroll skipped");
                }
            }, [scrollOnLoad, imageUrl, messageId]);

            const handleImageError = useCallback(
                (e) => {
                    console.error("❌ Image load error:", imageUrl);
                    setImageError(true);
                },
                [imageUrl]
            );

            // Preload image to reduce loading time
            useEffect(() => {
                console.log("🔄 Image preload effect:", imageUrl);
                if (imageUrl && !imageError) {
                    const img = new Image();
                    img.onload = () => {
                        console.log("✅ Preload success:", imageUrl);
                        setImageLoaded(true);
                    };
                    img.onerror = () => {
                        console.error("❌ Preload error:", imageUrl);
                        setImageError(true);
                    };
                    img.src = imageUrl;
                }
            }, [imageUrl, imageError]);

            if (imageError) {
                console.log("💥 Rendering error state for:", imageUrl);
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
                            <span className="text-sm">
                                Failed to load image
                            </span>
                        </div>
                    </div>
                );
            }

            console.log("🖼️ Rendering image:", {
                loaded: imageLoaded,
                imageUrl: imageUrl?.substring(0, 50) + "...",
            });

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
                        ref={imageRef}
                        src={imageUrl}
                        alt={alt}
                        className={`rounded-lg max-w-full h-auto shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                            imageLoaded ? "opacity-100" : "opacity-0 absolute"
                        }`}
                        style={{ maxHeight: "400px" }}
                        onClick={handleImageClick}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        loading="lazy"
                    />
                </div>
            );
        },
        [isModalOpen, scrollToBottomSmooth]
    );

    const closeModal = useCallback(() => {
        console.log("❌ Closing modal");
        isClosingModal.current = true;
        scrollingEnabled.current = false;
        setIsModalOpen(false);
        setPreviewImage(null);

        // Clear any pending scroll operations
        if (scrollTimeoutRef.current) {
            console.log("🧹 Clearing scroll timeout on modal close");
            clearTimeout(scrollTimeoutRef.current);
        }

        setTimeout(() => {
            if (document.activeElement && document.activeElement.blur) {
                document.activeElement.blur();
            }
        }, 50);

        setTimeout(() => {
            console.log("🔓 Re-enabling scrolling after modal close");
            isClosingModal.current = false;
            scrollingEnabled.current = true;
        }, 300);
    }, []);

    // Helper functions with debug logging
    const getImageUrl = useCallback((file) => {
        console.log("🔗 Getting image URL from:", typeof file, file);
        if (typeof file === "string") {
            return file;
        }
        const url = file?.url || file?.file || file?.src || file?.path || null;
        console.log("🔗 Extracted URL:", url);
        return url;
    }, []);

    const getImageAlt = useCallback((file, index) => {
        const alt =
            typeof file === "string"
                ? `Image ${index + 1}`
                : file?.name || file?.alt || `Image ${index + 1}`;
        console.log("📝 Generated alt text:", alt);
        return alt;
    }, []);

    // Memoize the messages rendering with debug logging
    const renderedMessages = useMemo(() => {
        console.log("📋 Rendering messages:", {
            count: messages.length,
            isStreaming,
            timestamp: new Date().toISOString(),
        });

        return messages.map((message, index) => {
            const isUser = message.sender === "user";
            const isLastMessage = index === messages.length - 1;
            const isCurrentlyStreaming =
                isStreaming && !isUser && isLastMessage && message.tempId;
            const messageKey = message.tempId || message.id || `msg-${index}`;

            console.log(`💬 Rendering message ${index}:`, {
                messageKey,
                isUser,
                isLastMessage,
                isCurrentlyStreaming,
                hasImage: !!message.image,
                filesCount: message.files?.length || 0,
                contentLength: message.content?.length || 0,
            });

            return (
                <div key={messageKey} className="flex justify-start">
                    {isUser ? (
                        <div>
                            {/* Single image */}
                            {message.image && (
                                <div className="mb-2">
                                    <ImageDisplay
                                        imageUrl={message.image}
                                        alt="User uploaded image"
                                        scrollOnLoad={true}
                                        messageId={messageKey}
                                    />
                                </div>
                            )}

                            {/* Multiple files */}
                            {message.files && message.files.length > 0 && (
                                <div className="mb-2 space-y-2">
                                    {message.files.map((file, fileIndex) => {
                                        const imageUrl = getImageUrl(file);
                                        const imageAlt = getImageAlt(
                                            file,
                                            fileIndex
                                        );

                                        console.log(
                                            `📎 Processing file ${fileIndex}:`,
                                            {
                                                file,
                                                imageUrl:
                                                    imageUrl?.substring(0, 50) +
                                                    "...",
                                                imageAlt,
                                            }
                                        );

                                        if (!imageUrl) {
                                            console.warn(
                                                "⚠️ No valid image URL found for file:",
                                                file
                                            );
                                            return null;
                                        }

                                        return (
                                            <ImageDisplay
                                                key={`${messageKey}-file-${fileIndex}`}
                                                imageUrl={imageUrl}
                                                alt={imageAlt}
                                                scrollOnLoad={true}
                                                messageId={`${messageKey}-${fileIndex}`}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {/* User message bubble */}
                            {message.content && message.content.trim() && (
                                <div className="inline-flex items-center bg-[#1a1a1a] text-white rounded-2xl px-3 py-3 max-w-full shadow-md">
                                    <AvatarInside user={user} />
                                    <span className="ml-2 break-words whitespace-pre-wrap text-sm">
                                        {message.content}
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-[90%] pl-2">
                            <div className="relative">
                                <div className="relative text-gray-800">
                                    <MarkdownTranslator
                                        content={message.content}
                                        className="text-sm leading-relaxed"
                                        isStreaming={isCurrentlyStreaming}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    }, [
        messages,
        isStreaming,
        user,
        ImageDisplay,
        AvatarInside,
        getImageUrl,
        getImageAlt,
    ]);

    console.log("🏁 ChatWindow render complete");

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
                            {renderedMessages}

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
