import { memo, useState } from "react";
import MarkdownTranslator from "../ChatWindow/MarkdownTranslator";
import SpeakerIcon from "./SpeakerIcon";

const BotMessage = memo(({ message, shouldStream }) => {
    const [isReferencesOpen, setIsReferencesOpen] = useState(false);

    if (!message?.content?.trim()) return null;

    const toggleReferences = () => {
        setIsReferencesOpen(!isReferencesOpen);
    };

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

                    {/* References section - only show if web search was used and references exist */}
                    {message.references && message.references.length > 0 && (
                        <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
                            {/* Collapsible Header */}
                            <button
                                onClick={toggleReferences}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                            >
                                <div className="text-xs font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
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
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                    Web Search Sources (
                                    {message.references.length})
                                </div>
                                <svg
                                    className={`w-4 h-4 text-blue-700 dark:text-blue-300 transition-transform duration-200 ${
                                        isReferencesOpen ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>

                            {/* Collapsible Content */}
                            <div
                                className={`transition-all duration-300 ease-in-out ${
                                    isReferencesOpen
                                        ? "max-h-96 opacity-100"
                                        : "max-h-0 opacity-0"
                                } overflow-hidden`}
                            >
                                <div className="px-4 pb-3 space-y-2">
                                    {message.references.map((ref, index) => (
                                        <div
                                            key={index}
                                            className="bg-white dark:bg-neutral-800 rounded-lg border border-blue-200 dark:border-blue-700 overflow-hidden hover:shadow-sm transition-shadow duration-200"
                                        >
                                            <a
                                                href={ref.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200 cursor-pointer"
                                                onClick={(e) => {
                                                    // Ensure the link opens in a new tab
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1">
                                                            {ref.title ||
                                                                `Source ${
                                                                    index + 1
                                                                }`}
                                                        </div>
                                                        {ref.snippet && (
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                                                {ref.snippet}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                            <span className="truncate">
                                                                {ref.link}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <svg
                                                        className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                        />
                                                    </svg>
                                                </div>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Speaker icon */}
                    <div className="mt-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <SpeakerIcon message={message} />
                    </div>
                </div>
            </div>
        </div>
    );
});

BotMessage.displayName = "BotMessage";

export default BotMessage;
