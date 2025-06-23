import { useEffect, useRef } from "react";
import MarkdownWrapper from "./MarkdownWrapper";

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
        () => {
            console.log("Text copied to clipboard");
        },
        (err) => {
            console.error("Failed to copy text: ", err);
        }
    );
};

export default function ChatWindow({ messages, isBotTyping }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, isBotTyping]);

    return (
        <div className="flex-1 overflow-hidden bg-[#FAFAFB]">
            <div
                ref={containerRef}
                className="h-full flex flex-col justify-end overflow-y-auto p-6 space-y-4"
            >
                {messages.map((msg) => {
                    const isUser = msg.sender === "user";

                    return (
                        <div
                            key={msg.id}
                            className={`flex group ${
                                isUser ? "justify-end" : "justify-start"
                            }`}
                        >
                            {!isUser && (
                                <div className="w-4 h-4 rounded-full bg-cyan-300 mt-2 mr-2 flex-shrink-0"></div>
                            )}

                            <div
                                className={`relative px-5 py-3 text-sm shadow-md inline-block ${
                                    isUser
                                        ? "bg-white text-gray-800 border-r-4 border-black rounded-l-sm rounded-t-sm rounded-b-sm"
                                        : "bg-white text-gray-900 border-l-4 border-[#002D74] rounded-r-sm rounded-t-sm rounded-b-sm"
                                }`}
                                style={{
                                    maxWidth: "80%",
                                    wordWrap: "break-word",
                                }}
                            >
                                <MarkdownWrapper
                                    content={msg.content || msg.text}
                                />

                                <div className="text-xs mt-1.5 opacity-70">
                                    {msg.timestamp ||
                                        new Date(
                                            typeof msg.id === "number"
                                                ? msg.id
                                                : Date.now()
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(msg.text)}
                                    title="Copy message"
                                    className="absolute top-1 right-1 p-1 bg-gray-500 bg-opacity-0 hover:bg-opacity-20 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                >
                                    📋
                                </button>
                            </div>

                            {isUser && (
                                <div className="w-4 h-4 rounded-md bg-black mt-2 ml-2 flex-shrink-0"></div> // Giữ lại style avatar user ban đầu
                            )}
                        </div>
                    );
                })}
                {isBotTyping && (
                    <div className="flex justify-start">
                        {/* Avatar cho "Bot is typing" - bạn có thể điều chỉnh class nếu muốn nó giống hệt avatar bot ở trên */}
                        <div className="w-4 h-4 rounded-full bg-cyan-300 mt-auto mr-2 flex-shrink-0 self-end mb-1"></div>
                        <div
                            className="relative px-4 py-2.5 text-sm shadow-md inline-block bg-white text-gray-600 border border-gray-200 rounded-r-lg rounded-t-lg rounded-bl-lg"
                            // Không thêm inline style ở đây trừ khi thật sự cần thiết và bạn yêu cầu
                        >
                            <div className="flex items-center space-x-1">
                                <span className="animate-pulse">●</span>
                                <span className="animate-pulse delay-75">
                                    ●
                                </span>
                                <span className="animate-pulse delay-150">
                                    ●
                                </span>
                                <span className="ml-1">Bot is typing...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
