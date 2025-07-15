import React, { useEffect, useRef, useState } from "react";
import MarkdownWrapper from "./MarkdownWrapper";

// Memoized User Message Component
const UserMessage = React.memo(({ message, user }) => {
    const AvatarInside = ({ user }) => {
        const initial =
            user?.fullName?.charAt(0) || user?.email?.charAt(0) || "A";
        return (
            <div className="w-6 h-6 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center text-xs font-semibold mr-2 flex-shrink-0">
                {initial.toUpperCase()}
            </div>
        );
    };

    // Memoized component to render image with error handling
    const ImageDisplay = React.memo(({ imageUrl, altText = "Uploaded image" }) => {
        return (
            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <img
                    src={imageUrl}
                    alt={altText}
                    className="rounded-lg shadow-md max-w-full h-auto"
                    style={{ maxHeight: '400px' }}
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 max-w-xs" style={{ display: 'none' }}>
                    <div className="text-gray-500 text-sm">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image failed to load
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="bg-[#1a1a1a] text-white rounded-2xl px-3 py-2 text-sm max-w-[90%] flex items-start whitespace-pre-wrap">
            <AvatarInside user={user} />
            <div className="flex flex-col gap-2 flex-1">
                {/* Display image from schema OR from files (avoid duplicates) */}
                {message.image && (
                    <ImageDisplay 
                        imageUrl={message.image} 
                        altText="User uploaded image" 
                    />
                )}
                {/* Only show files if no direct image field */}
                {!message.image && message.files && message.files.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {message.files.map((file, fileIndex) => (
                            <div key={fileIndex}>
                                {file.type && file.type.startsWith('image/') ? (
                                    <ImageDisplay 
                                        imageUrl={file.url || file.src} 
                                        altText={file.name || "Uploaded image"} 
                                    />
                                ) : (
                                    <div className="bg-gray-700 rounded p-2 text-xs">
                                        📎 {file.name || 'Attached file'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {/* Display text content */}
                {message.content && (
                    <span className="break-words">
                        {message.content}
                    </span>
                )}
            </div>
        </div>
    );
});

// Memoized Bot Message Component
const BotMessage = React.memo(({ message, isStreamingMessage, messageKey }) => {
    return (
        <div className="max-w-[90%] pl-2">
            <div className="relative">
                {/* Always show markdown - streaming or not */}
                <div className="relative">
                    <MarkdownWrapper
                        key={messageKey}
                        content={message.content}
                    />

                    {/* Show streaming indicator */}
                    {isStreamingMessage && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-orange-500">
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                                <div
                                    className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                                    style={{
                                        animationDelay: "0.1s",
                                    }}
                                ></div>
                                <div
                                    className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                                    style={{
                                        animationDelay: "0.2s",
                                    }}
                                ></div>
                            </div>
                            <span>
                                AI is typing...
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

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

    // Component to render image with error handling
    const ImageDisplay = ({ imageUrl, altText = "Uploaded image" }) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoading, setImageLoading] = useState(true);

        if (imageError) {
            return (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 max-w-xs">
                    <div className="text-gray-500 text-sm">
                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image failed to load
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                {imageLoading && (
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 animate-pulse">
                        <div className="text-gray-500 text-sm text-center">Loading image...</div>
                    </div>
                )}
                <img
                    src={imageUrl}
                    alt={altText}
                    className={`rounded-lg shadow-md max-w-full h-auto ${imageLoading ? 'hidden' : 'block'}`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        setImageError(true);
                        setImageLoading(false);
                    }}
                    style={{ maxHeight: '400px' }}
                />
            </div>
        );
    };

    return (
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-white">
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
                            const isLastMessage = index === messages.length - 1;
                            const isStreamingMessage =
                                isLastMessage && !isUser && isStreaming;

                            return (
                                <div
                                    key={message.tempId || message.id || index}
                                    className="flex justify-start"
                                >
                                    {isUser ? (
                                        <UserMessage message={message} user={user} />
                                    ) : (
                                        <BotMessage 
                                            message={message} 
                                            isStreamingMessage={isStreamingMessage}
                                            messageKey={`${message.tempId || message.id || index}-${message.content?.length || 0}`}
                                        />
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
    );
}