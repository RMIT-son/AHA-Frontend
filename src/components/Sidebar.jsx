import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ConversationModal from "./ConversationModal";
import SearchChatModal from "./SearchChatModal";
import { searchAllChats } from "../controllers/chat"; // Add missing import
import Cookies from "js-cookie";

const Sidebar = ({
    isOpen,
    chatRooms = [],
    onSelectRoom,
    activeRoomId,
    onRenameRoom,
    onDeleteRoom,
    onToggle,
    user,
}) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // 'rename' or 'delete'
        roomId: null,
        roomName: "",
    });

    // Add search modal state - this was missing
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResults] = useState([]); // State for search results
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Get user display name and initial from user prop
    const displayName = user?.fullName || user?.name || "User";
    const displayInitial = displayName.charAt(0).toUpperCase();

    // Replace the formatChatName function in your Sidebar.jsx
    const formatChatName = (room) => {
        // First priority: use the actual title from database if it exists
        if (room.title && room.title.trim() !== "") {
            return room.title;
        }

        // Second priority: use the name field if it's not the default format
        if (room.name && room.name !== `Chat ${room.id?.slice(-5)}`) {
            return room.name;
        }

        // Last resort: use the last message snippet or default
        return room.lastMessageSnippet &&
            room.lastMessageSnippet !== "No messages yet"
            ? room.lastMessageSnippet.slice(0, 30) + "..."
            : `Chat ${room.id?.slice(-5) || "New"}`;
    };

    const sortedChatRooms = [...chatRooms].sort((a, b) => {
        if (a.lastMessageTime && b.lastMessageTime) {
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        }
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (a.id && b.id) {
            return b.id.localeCompare(a.id);
        }
        return 0;
    });

    const handleStartNewChat = () => {
        if (onSelectRoom) {
            onSelectRoom(null);
        }
        // Close sidebar on mobile after selecting
        if (isMobile && isOpen) {
            onToggle();
        }
    };

    const handleDropdownToggle = (roomId, e) => {
        e.stopPropagation();
        setActiveDropdown(activeDropdown === roomId ? null : roomId);
    };

    const handleRename = (room, e) => {
        e.stopPropagation();
        setModalState({
            isOpen: true,
            type: "rename",
            roomId: room.id,
            roomName: formatChatName(room),
        });
        setActiveDropdown(null);
    };

    const handleDelete = (roomId, e) => {
        e.stopPropagation();
        setModalState({
            isOpen: true,
            type: "delete",
            roomId: roomId,
            roomName: "",
        });
        setActiveDropdown(null);
    };

    const handleModalClose = () => {
        setModalState({
            isOpen: false,
            type: null,
            roomId: null,
            roomName: "",
        });
    };

    const handleModalRename = async (newName) => {
        if (onRenameRoom && modalState.roomId) {
            await onRenameRoom(modalState.roomId, newName);
        }
    };

    const handleModalDelete = async () => {
        if (onDeleteRoom && modalState.roomId) {
            await onDeleteRoom(modalState.roomId);
        }
    };

    // Handle search button click
    const handleSearchClick = () => {
        setIsSearchModalOpen(true);
    };

    // Handle search modal close
    const handleSearchModalClose = () => {
        setIsSearchModalOpen(false);
    };

    // Handle chat selection from search
    const handleSearchChatSelect = (chatId) => {
        if (onSelectRoom) {
            onSelectRoom(chatId);
        }
        // Close sidebar on mobile after selecting
        if (isMobile && isOpen) {
            onToggle();
        }
    };

    // Fixed logout function
    const handleLogout = () => {
        try {
            // Remove the cookie
            Cookies.remove("user");

            // Update Redux store to clear user data
            dispatch({ type: "LOGOUT" });

            // Navigate to login page
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
            // Force navigation even if there's an error
            navigate("/login");
        }
    };

    const handleRoomSelect = (roomId) => {
        if (onSelectRoom) {
            onSelectRoom(roomId);
        }
        // Close sidebar on mobile after selecting a room
        if (isMobile && isOpen) {
            onToggle();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdown(null);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <>
            <div
                className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "w-64" : "w-16"
                } bg-gray-800 text-white flex flex-col overflow-hidden relative`}
            >
                {/* Header */}
                <div className="px-3 py-4 flex-shrink-0">
                    <div
                        className={`flex items-center gap-2 ${
                            isOpen ? "mb-6 md:mb-8" : "mb-6 justify-center"
                        }`}
                    >
                        {isOpen ? (
                            <>
                                <button
                                    onClick={onToggle}
                                    className="p-1 hover:bg-gray-700 rounded transition-colors"
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
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Logo Container - Centered */}
                                <div className="flex-1 flex justify-center">
                                    {/* Logo Image */}
                                    <img
                                        src="/logo.png"
                                        alt="AI Healthcare Assistant"
                                        className="h-8 w-auto max-w-[180px] object-contain"
                                        onError={(e) => {
                                            // Fallback to a default icon if image fails to load
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />

                                    {/* Fallback Icon (hidden by default, shown if image fails) */}
                                    <div
                                        className="h-8 w-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center"
                                        style={{ display: "none" }}
                                    >
                                        <svg
                                            className="w-5 h-5 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-gray-700 rounded transition-colors"
                                title="Expand sidebar"
                                aria-label="Expand sidebar"
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
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Button Container */}
                    <div className="space-y-2">
                        {/* New Chat Button */}
                        <button
                            onClick={handleStartNewChat}
                            className={`w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 text-sm font-medium touch-manipulation ${
                                isOpen
                                    ? "px-3 py-2.5 md:py-2.5 flex items-center gap-2"
                                    : "p-3 flex items-center justify-center"
                            }`}
                            title={!isOpen ? "New chat" : ""}
                        >
                            <svg
                                className="w-4 h-4 flex-shrink-0"
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
                            {isOpen && <span>New chat</span>}
                        </button>

                        {/* Search Button */}
                        <button
                            onClick={handleSearchClick}
                            className={`w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 text-sm font-medium touch-manipulation ${
                                isOpen
                                    ? "px-3 py-2.5 flex items-center gap-2"
                                    : "p-3 flex items-center justify-center"
                            }`}
                            title={!isOpen ? "Search chats" : ""}
                        >
                            <svg
                                className="w-4 h-4 flex-shrink-0"
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
                            {isOpen && <span>Search chats</span>}
                        </button>
                    </div>
                </div>

                {/* Recents Section */}
                {isOpen && (
                    <div className="flex-1 overflow-y-auto px-3 pb-3">
                        {sortedChatRooms.length > 0 && (
                            <>
                                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">
                                    Recents
                                </div>
                                <div className="space-y-1">
                                    {sortedChatRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className={`relative group rounded-md transition-colors ${
                                                activeRoomId === room.id
                                                    ? "bg-gray-700"
                                                    : "hover:bg-gray-700"
                                            } cursor-pointer`}
                                        >
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() =>
                                                        handleRoomSelect(
                                                            room.id
                                                        )
                                                    }
                                                    className="flex-1 text-left px-2 py-3 md:py-2 text-sm transition-colors flex items-center gap-2 min-w-0 touch-manipulation"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <span
                                                            className={`truncate block ${
                                                                activeRoomId ===
                                                                room.id
                                                                    ? "text-white"
                                                                    : "text-gray-300 group-hover:text-white"
                                                            }`}
                                                        >
                                                            {formatChatName(
                                                                room
                                                            )}
                                                        </span>
                                                    </div>
                                                </button>

                                                <div className="relative flex-shrink-0">
                                                    <button
                                                        onClick={(e) =>
                                                            handleDropdownToggle(
                                                                room.id,
                                                                e
                                                            )
                                                        }
                                                        className={`p-2 mr-1 hover:bg-gray-600 rounded transition-all duration-200 touch-manipulation ${
                                                            isMobile
                                                                ? "opacity-100"
                                                                : "opacity-0 group-hover:opacity-100"
                                                        }`}
                                                    >
                                                        <svg
                                                            className="w-4 h-4 text-gray-400 hover:text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {activeDropdown ===
                                                        room.id && (
                                                        <div className="absolute right-0 top-8 w-32 bg-gray-700 rounded-md border border-gray-600 shadow-lg z-10 overflow-hidden">
                                                            <button
                                                                onClick={(e) =>
                                                                    handleRename(
                                                                        room,
                                                                        e
                                                                    )
                                                                }
                                                                className="w-full text-left px-3 py-3 md:py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors flex items-center gap-2 touch-manipulation"
                                                            >
                                                                <svg
                                                                    className="w-3 h-3"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                                Rename
                                                            </button>
                                                            <button
                                                                onClick={(e) =>
                                                                    handleDelete(
                                                                        room.id,
                                                                        e
                                                                    )
                                                                }
                                                                className="w-full text-left px-3 py-3 md:py-2 text-sm text-red-400 hover:bg-gray-600 transition-colors flex items-center gap-2 touch-manipulation"
                                                            >
                                                                <svg
                                                                    className="w-3 h-3"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* User Profile */}
                <div className="p-3 border-t border-gray-700 mt-auto">
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`w-full hover:bg-gray-700 rounded-md transition-colors text-sm ${
                                isOpen
                                    ? "flex items-center gap-2 p-2"
                                    : "p-2 flex items-center justify-center"
                            }`}
                            title={!isOpen ? displayName : ""}
                        >
                            <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                {displayInitial}
                            </div>
                            {isOpen && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="font-medium text-white truncate">
                                            {displayName}
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
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
                                </>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isUserMenuOpen && isOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-700 rounded-md border border-gray-600 shadow-lg overflow-hidden">
                                <button
                                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate("/settings/profile");
                                    }}
                                >
                                    Settings
                                </button>

                                <div className="border-t border-gray-600">
                                    <button
                                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-600 transition-colors"
                                        onClick={handleLogout}
                                    >
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ConversationModal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                type={modalState.type}
                chatName={modalState.roomName}
                onRename={handleModalRename}
                onDelete={handleModalDelete}
            />

            {/* Search Modal */}
            <SearchChatModal
                isOpen={isSearchModalOpen}
                onClose={handleSearchModalClose}
                onSelectChat={handleSearchChatSelect}
                user={user}
            />
        </>
    );
};

export default Sidebar;
