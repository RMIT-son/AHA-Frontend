import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // ✅ Import Cookies

const Sidebar = ({ isOpen, chatRooms = [], onSelectRoom, activeRoomId }) => {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // ✅ Extract user info from cookies
    const user = Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null;
    const displayName = user?.fullName || user?.email || "Guest";
    const displayInitial = displayName.charAt(0).toUpperCase();

    const formatChatName = (room) => {
        if (room.name && room.name !== `Chat ${room.id?.slice(-5)}`) {
            return room.name;
        }
        return room.lastMessageSnippet &&
            room.lastMessageSnippet !== "No messages yet"
            ? room.lastMessageSnippet.slice(0, 25) + "..."
            : `Chat ${room.id?.slice(-5) || "New"}`;
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return "";
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
        if (diffInHours < 1) return "now";
        if (diffInHours < 24) return `${diffInHours}h`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
        return `${Math.floor(diffInHours / 168)}w`;
    };

    return (
        <div
            className={`transition-all duration-300 ease-in-out ${
                isOpen ? "w-80" : "w-0"
            } bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden border-r border-[#1a1a1a]`}
        >
            <div
                className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)] opacity-40 pointer-events-none ${
                    !isOpen && "hidden"
                }`}
            />

            {/* Header */}
            <div className={`p-6 pb-4 z-10 ${!isOpen && "hidden"}`}>
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        ChatBot
                    </h1>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>

                {/* New Chat Button */}
                <button
                    onClick={() => navigate("/")}
                    className="group w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg p-4 flex items-center justify-center gap-3 transition-all duration-200 border border-[#2a2a2a]"
                >
                    <svg
                        className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    <span className="font-medium">Start New Chat</span>
                </button>
            </div>

            {/* Chat Rooms */}
            <div
                className={`flex-1 overflow-hidden flex flex-col z-10 ${
                    !isOpen && "hidden"
                }`}
            >
                {chatRooms.length > 0 && (
                    <div className="px-6 pb-2">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                Recent Chats
                            </h3>
                            <div className="flex-1 h-px bg-[#2a2a2a]" />
                            <span className="text-xs text-gray-600 bg-[#1a1a1a] px-2 py-1 rounded-full">
                                {chatRooms.length}
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 space-y-2 scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
                    {chatRooms.map((room, index) => (
                        <button
                            key={room.id}
                            onClick={() =>
                                onSelectRoom && onSelectRoom(room.id)
                            }
                            className={`group w-full text-left p-3 rounded-lg transition-all duration-200 ${
                                activeRoomId === room.id
                                    ? "bg-[#1a1a1a] border border-[#2a2a2a]"
                                    : "hover:bg-[#1a1a1a]"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className={`w-2 h-2 rounded-full ${
                                                activeRoomId === room.id
                                                    ? "bg-blue-400"
                                                    : "bg-gray-600"
                                            }`}
                                        />
                                        <span
                                            className={`text-sm font-medium truncate ${
                                                activeRoomId === room.id
                                                    ? "text-blue-200"
                                                    : "text-gray-200"
                                            }`}
                                        >
                                            {formatChatName(room)}
                                        </span>
                                    </div>
                                    {room.lastMessageSnippet &&
                                        room.lastMessageSnippet !==
                                            "No messages yet" && (
                                            <p className="text-xs text-gray-400 truncate pl-4">
                                                {room.lastMessageSnippet}
                                            </p>
                                        )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-500">
                                        {getTimeAgo(room.lastMessageTime)}
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <svg
                                            className="w-4 h-4 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* User Profile Section */}
            <div
                className={`p-6 pt-4 z-10 border-t border-gray-800/50 ${
                    !isOpen && "hidden"
                }`}
            >
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="group w-full bg-gray-800/60 hover:bg-gray-700/60 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                        {/* ✅ Avatar Letter */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold text-white">
                            {displayInitial}
                        </div>

                        {/* ✅ User Info */}
                        <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-gray-200">
                                {displayName}
                            </div>
                            <div className="text-xs text-gray-400">
                                Free Plan
                            </div>
                        </div>

                        <svg
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                isUserMenuOpen ? "rotate-180" : ""
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

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-xl overflow-hidden">
                            <button className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3">
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
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                Profile Settings
                            </button>
                            <button className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3">
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
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Preferences
                            </button>
                            <div className="border-t border-gray-700/50">
                                <button
                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 flex items-center gap-3"
                                    onClick={() => {
                                        Cookies.remove("user");
                                        navigate("/login");
                                    }}
                                >
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
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
