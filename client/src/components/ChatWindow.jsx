import { useEffect, useRef } from 'react';

export default function ChatWindow({ messages, isBotTyping }) {
    const messagesEndRef = useRef(null);
    const scrollAreaRef = useRef(null);
    const previousMessagesLength = useRef(0);
    const isNewConversation = useRef(true);

    const positionAtBottomInstant = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    };

    const scrollToBottomSmooth = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const messagesIncreased = messages.length > previousMessagesLength.current;

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

    return (
        <div
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F9F9FC]"
        >
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Start a conversation...</p>
                </div>
            ) : (
                messages.map((message, index) => {
                    const isUser = message.sender === 'user';
                    const isError = message.isError;

                    return (
                        <div
                            key={message.tempId || message.id || index}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end gap-2`}
                        >
                            {/* Bot avatar (bottom aligned) */}
                            {!isUser && (
                                <div className="w-4 h-4 bg-cyan-200 rounded-sm" />
                            )}

                            {/* Message bubble */}
                            <div
                                className={`
                                    max-w-sm md:max-w-md px-4 py-3 text-sm rounded-lg shadow relative
                                    ${isUser 
                                        ? 'bg-white text-gray-900 border-r-4 border-black' 
                                        : isError 
                                        ? 'bg-red-100 text-red-800 border-l-4 border-red-300' 
                                        : 'bg-gray-100 text-gray-800 border-l-4 border-blue-900'
                                    }
                                `}
                            >
                                {message.content}
                            </div>

                            {/* User avatar (bottom aligned) */}
                            {isUser && (
                                <div className="w-4 h-4 bg-black rounded-sm" />
                            )}
                        </div>
                    );
                })
            )}

            {/* Typing indicator */}
            {isBotTyping && (
                <div className="flex justify-start items-end gap-2">
                    <div className="w-4 h-4 bg-cyan-200 rounded-sm" />
                    <div className="bg-gray-100 text-gray-800 max-w-sm md:max-w-md px-4 py-3 rounded-lg border-l-4 border-blue-900">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}