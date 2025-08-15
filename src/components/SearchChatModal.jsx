import React, { useState, useEffect, useRef } from "react";
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
                    className="bg-yellow-200 text-gray-900 px-1 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        Search Chats
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
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
                <div className="p-4 border-b border-gray-700">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-4 w-4 text-gray-400"
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
                                placeholder="Search your chats..."
                                className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-3 py-2.5 text-sm rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                            {/* Show typing indicator */}
                            {isSearching && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Search status indicator */}
                    {searchQuery.trim() && (
                        <div className="mt-2 text-xs text-gray-400">
                            {isSearching ? (
                                <span className="flex items-center gap-1">
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    Searching...
                                </span>
                            ) : hasSearched ? (
                                <span>
                                    {searchResults.length} result
                                    {searchResults.length !== 1 ? "s" : ""}{" "}
                                    found
                                </span>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto">
                    {!isSearching &&
                        hasSearched &&
                        searchResults.length === 0 &&
                        searchQuery.trim() && (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <svg
                                    className="w-12 h-12 text-gray-500 mb-4"
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
                                <h3 className="text-lg font-medium text-gray-300 mb-2">
                                    No results found
                                </h3>
                                <p className="text-gray-500 text-center">
                                    We couldn't find any chats matching "
                                    {searchQuery}". Try different keywords.
                                </p>
                            </div>
                        )}

                    {!isSearching &&
                        hasSearched &&
                        searchResults.length > 0 && (
                            <div className="p-4">
                                <div className="space-y-2">
                                    {searchResults.map((conversation) => (
                                        <button
                                            key={conversation.conversation_id}
                                            onClick={() =>
                                                handleChatSelect(conversation)
                                            }
                                            className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-white text-sm mb-1 line-clamp-1">
                                                        {highlightText(
                                                            stripHtmlTags(
                                                                conversation.title
                                                            ),
                                                            searchQuery
                                                        )}
                                                    </div>
                                                    <div className="text-gray-400 text-xs line-clamp-2">
                                                        {highlightText(
                                                            stripHtmlTags(
                                                                conversation.snippet
                                                            ),
                                                            searchQuery
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0 text-xs text-gray-500">
                                                    {formatTimestamp(
                                                        conversation.last_message_timestamp
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                    {!hasSearched && !searchQuery.trim() && (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                            <svg
                                className="w-12 h-12 text-gray-500 mb-4"
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
                            <h3 className="text-lg font-medium text-gray-300 mb-2">
                                Search your chats
                            </h3>
                            <p className="text-gray-500 text-center">
                                Enter keywords to find specific conversations or
                                messages.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchChatModal;
