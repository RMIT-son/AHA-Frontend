import { memo } from "react";
import MarkdownTranslator from "../ChatWindow/MarkdownTranslator";
import SpeakerIcon from "./SpeakerIcon";

const BotMessage = memo(({ message, shouldStream }) => {
    if (!message?.content?.trim()) return null;

    return (
        <div className="group relative mb-6 flex justify-start">
            <div className="max-w-[85%] relative flex items-start gap-3">
                {/* AI Avatar */}
                <div className="w-8 h-8 mt-1 flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                </div>

                {/* Message Content */}
                <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 dark:bg-neutral-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                        <MarkdownTranslator
                            content={message.content}
                            className="text-sm leading-relaxed text-gray-800 dark:text-white"
                            isStreaming={shouldStream}
                        />
                    </div>

                    {/* Speaker icon */}
                    <div className="mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <SpeakerIcon message={message} />
                    </div>
                </div>
            </div>
        </div>
    );
});

export default BotMessage;
