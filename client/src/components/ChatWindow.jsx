import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

export default function ChatWindow({ messages, isBotTyping }) {
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
        } else if (isBotTyping || messagesIncreased) {
            scrollToBottomSmooth();
        }

        previousMessagesLength.current = messages.length;
    }, [messages, isBotTyping]);

    useEffect(() => {
        if (
            messages.length === 0 ||
            (previousMessagesLength.current > 0 &&
                messages.length !== previousMessagesLength.current + 1)
        ) {
            isNewConversation.current = true;
        }
    }, [messages]);

    // ✅ Markdown formatting: convert \n to "  \n" for proper new lines
    const formatMarkdown = (text) => {
        return text.replace(/\n/g, "  \n");
    };

    // Markdown component with custom styling
    const MarkdownContent = ({ content }) => (
        <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            components={{
                p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                ),
                h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-3 text-gray-900">
                        {children}
                    </h1>
                ),
                h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 text-gray-900">
                        {children}
                    </h2>
                ),
                h3: ({ children }) => (
                    <h3 className="text-base font-bold mb-2 text-gray-900">
                        {children}
                    </h3>
                ),
                ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-3 space-y-1">
                        {children}
                    </ul>
                ),
                ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-3 space-y-1">
                        {children}
                    </ol>
                ),
                li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                ),
                code: ({ inline, children }) =>
                    inline ? (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                            {children}
                        </code>
                    ) : (
                        <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
                            {children}
                        </code>
                    ),
                pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg mb-3 overflow-x-auto">
                        {children}
                    </pre>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-3 text-gray-700">
                        {children}
                    </blockquote>
                ),
                strong: ({ children }) => (
                    <strong className="font-bold text-gray-900">
                        {children}
                    </strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                a: ({ href, children }) => (
                    <a
                        href={href}
                        className="text-blue-600 hover:text-blue-800 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ),
                hr: () => <hr className="border-gray-200 my-4" />,
            }}
        >
            {formatMarkdown(content)}
        </ReactMarkdown>
    );

    return (
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-white">
            {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full px-4">
                    <div className="text-center max-w-2xl">
                        <h1 className="text-3xl font-light text-gray-800 mb-4">
                            Hello, what can I help you with today?
                        </h1>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="space-y-6">
                        {messages.map((message, index) => {
                            const isUser = message.sender === "user";
                            const isError = message.isError;

                            return (
                                <div
                                    key={message.tempId || message.id || index}
                                    className={`flex ${
                                        isUser ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] ${
                                            isUser ? "ml-auto" : "mr-auto"
                                        }`}
                                    >
                                        <div
                                            className={`px-4 py-3 rounded-2xl ${
                                                isUser
                                                    ? "bg-gray-100 text-gray-900"
                                                    : isError
                                                    ? "bg-red-50 text-red-800 border border-red-200"
                                                    : "bg-white text-gray-900 border border-gray-200"
                                            }`}
                                        >
                                            <div className="prose prose-sm max-w-none">
                                                {isUser ? (
                                                    <p className="mb-0 whitespace-pre-wrap leading-relaxed text-sm">
                                                        {message.content}
                                                    </p>
                                                ) : (
                                                    <div className="text-sm">
                                                        <MarkdownContent
                                                            content={
                                                                message.content
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {message.status === "pending" && (
                                            <div
                                                className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
                                                    isUser
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                                Sending...
                                            </div>
                                        )}

                                        {message.status === "failed" && (
                                            <div
                                                className={`flex items-center gap-2 mt-2 text-xs text-red-500 ${
                                                    isUser
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                                                Failed to send
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {isBotTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                    <div className="flex space-x-1">
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
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
