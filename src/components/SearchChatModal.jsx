import { useState, useEffect, useRef } from "react";
import { searchAllChats } from "../controllers/chat";

const SearchChatModal = ({ isOpen, onClose, onSelectChat, user }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const searchInputRef = useRef(null);
    const debounceTimeoutRef = useRef(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current.focus();
            }, 100);
        }
    }, [isOpen]);

    // Clear search when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setSearchResults([]);
            setHasSearched(false);
            // Clear any pending debounce timeout
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        }
    }, [isOpen]);

    const handleSearch = async (query = searchQuery) => {
        if (!query.trim() || !user?.id) {
            // If search query is empty, reset results
            if (!query.trim()) {
                setSearchResults([]);
                setHasSearched(false);
                setIsSearching(false);
            }
            return;
        }

        setIsSearching(true);
        setHasSearched(true);

        try {
            const response = await searchAllChats(query.trim(), user.id);

            // Handle the response structure based on your backend
            if (response?.results?.conversations) {
                setSearchResults(response.results.conversations);
            } else if (Array.isArray(response)) {
                setSearchResults(response);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounced search effect - triggers search when searchQuery changes
    useEffect(() => {
        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Only search if modal is open and user exists
        if (isOpen && user?.id) {
            if (searchQuery.trim()) {
                // Set a debounce timeout to avoid too many API calls
                debounceTimeoutRef.current = setTimeout(() => {
                    handleSearch(searchQuery);
                }, 300); // 300ms debounce
            } else {
                // If search query is empty, clear results immediately
                setSearchResults([]);
                setHasSearched(false);
                setIsSearching(false);
            }
        }

        // Cleanup function
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [searchQuery, isOpen, user?.id]);

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            // Clear debounce and search immediately on Enter
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            handleSearch();
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    const handleChatSelect = (conversation) => {
        onSelectChat(conversation.conversation_id);
        onClose();
    };

    const formatTimestamp = (timestamp) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                return date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                });
            } else if (diffDays === 1) {
                return "Yesterday";
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else {
                return date.toLocaleDateString();
            }
        } catch {
            return "";
        }
    };

    const stripHtmlTags = (html) => {
        return html?.replace(/<[^>]*>/g, "") || "";
    };

    const highlightText = (text, query) => {
        if (!query.trim()) return text;

        const regex = new RegExp(
            `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
            "gi"
        );
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark
                    key={index}
                    className="bg-emerald-200/80 dark:bg-emerald-400/30 text-emerald-900 dark:text-emerald-100 px-1 rounded-sm"
                >
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden backdrop-blur-md">
                {/* Ambient background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/5 to-teal-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/3 to-cyan-500/3 rounded-full blur-2xl" />
                </div>

                {/* Header */}
                <div className="relative flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-800/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2.5}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                Search Consultations
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Find your past conversations and messages
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="group p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <svg
                            className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative p-6 border-b border-slate-200/40 dark:border-slate-700/40">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-slate-400 dark:text-slate-500"
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
                        </div>
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search consultations, messages, or topics..."
                            className="w-full bg-slate-50/80 dark:bg-slate-700/60 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pl-12 pr-12 py-4 text-base rounded-xl border border-slate-200/60 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 dark:focus:ring-emerald-400/50 dark:focus:border-emerald-400/50 transition-all duration-200 backdrop-blur-sm shadow-sm"
                        />
                        {/* Loading spinner */}
                        {isSearching && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <div className="w-5 h-5 border-2 border-emerald-500/30 dark:border-emerald-400/30 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>

                    {/* Search status */}
                    {searchQuery.trim() && (
                        <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {isSearching ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-3 h-3 border border-slate-400 dark:border-slate-500 border-t-emerald-500 dark:border-t-emerald-400 rounded-full animate-spin"></div>
                                        Searching your consultations...
                                    </span>
                                ) : hasSearched ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        {searchResults.length} result
                                        {searchResults.length !== 1
                                            ? "s"
                                            : ""}{" "}
                                        found
                                    </span>
                                ) : null}
                            </div>
                            {searchQuery.trim() && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-all duration-200"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                    {/* No results state */}
                    {!isSearching &&
                        hasSearched &&
                        searchResults.length === 0 &&
                        searchQuery.trim() && (
                            <div className="flex flex-col items-center justify-center py-16 px-6">
                                <div className="relative">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/60 rounded-2xl flex items-center justify-center mb-4">
                                        <svg
                                            className="w-8 h-8 text-slate-400 dark:text-slate-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                    No consultations found
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                                    We couldn't find any consultations matching
                                    "{searchQuery}". Try using different
                                    keywords or check your spelling.
                                </p>
                            </div>
                        )}

                    {/* Search results */}
                    {!isSearching &&
                        hasSearched &&
                        searchResults.length > 0 && (
                            <div className="p-6">
                                <div className="space-y-3">
                                    {searchResults.map(
                                        (conversation, index) => (
                                            <div
                                                key={
                                                    conversation.conversation_id
                                                }
                                                className="group animate-in slide-in-from-bottom duration-300"
                                                style={{
                                                    animationDelay: `${
                                                        index * 50
                                                    }ms`,
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        handleChatSelect(
                                                            conversation
                                                        )
                                                    }
                                                    className="w-full text-left p-4 rounded-xl bg-slate-50/60 dark:bg-slate-700/40 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 border border-slate-200/40 dark:border-slate-600/40 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-200 hover:shadow-md active:scale-[0.98] backdrop-blur-sm"
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            {/* Conversation icon */}
                                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <svg
                                                                    className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                                                                    fill="currentColor"
                                                                    viewBox="0 0 20 20"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z"
                                                                        clipRule="evenodd"
                                                                    />
                                                                </svg>
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-slate-800 dark:text-white text-sm mb-1 line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-200">
                                                                    {highlightText(
                                                                        stripHtmlTags(
                                                                            conversation.title
                                                                        ),
                                                                        searchQuery
                                                                    )}
                                                                </div>
                                                                <div className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                                                    {highlightText(
                                                                        stripHtmlTags(
                                                                            conversation.snippet
                                                                        ),
                                                                        searchQuery
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <div className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                                                                {formatTimestamp(
                                                                    conversation.last_message_timestamp
                                                                )}
                                                            </div>
                                                            <div className="w-2 h-2 bg-emerald-500/60 dark:bg-emerald-400/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Initial state */}
                    {!hasSearched && !searchQuery.trim() && (
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                    <svg
                                        className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
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
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-3 h-3 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                                Search Your Consultations
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-center max-w-md leading-relaxed">
                                Find specific conversations, topics, or messages
                                from your consultation history. Start typing to
                                search.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchChatModal;
