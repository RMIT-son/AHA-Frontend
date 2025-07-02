import { useEffect, useRef } from "react";
import MarkdownWrapper from "./MarkdownWrapper";

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
                                        <div className="bg-[#1a1a1a] text-white rounded-2xl px-3 py-2 text-sm max-w-[90%] flex items-center whitespace-pre-wrap">
                                            <AvatarInside user={user} />
                                            <span className="break-words">
                                                {message.content}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="max-w-[90%] pl-2">
                                            <div className="relative">
                                                {/* Show streaming content as plain text during streaming */}
                                                {isStreamingMessage ? (
                                                    <div className="prose prose-sm max-w-none text-gray-900">
                                                        <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400">
                                                            {message.content}
                                                            <span className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1"></span>
                                                        </div>
                                                        <div className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                                            <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                                                            <div
                                                                className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                                                                style={{
                                                                    animationDelay:
                                                                        "0.1s",
                                                                }}
                                                            ></div>
                                                            <div
                                                                className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"
                                                                style={{
                                                                    animationDelay:
                                                                        "0.2s",
                                                                }}
                                                            ></div>
                                                            <span className="ml-1">
                                                                Streaming
                                                                response...
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Show markdown when not streaming */
                                                    <MarkdownWrapper
                                                        key={`${
                                                            message.tempId ||
                                                            message.id ||
                                                            index
                                                        }-${
                                                            message.content
                                                                ?.length || 0
                                                        }`}
                                                        content={
                                                            message.content
                                                        }
                                                    />
                                                )}
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
    );
}
