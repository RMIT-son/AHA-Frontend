import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ConversationModal from "./ConversationModal";
import SearchChatModal from "./SearchChatModal";
import { searchAllChats } from "../controllers/chat";
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
        type: null,
        roomId: null,
        roomName: "",
    });

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResults] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const displayName = user?.fullName || user?.name || "Dr. Assistant";
    const displayInitial = displayName.charAt(0).toUpperCase();

    const formatChatName = (room) => {
        if (room.title && room.title.trim() !== "") {
            return room.title;
        }

        if (room.name && room.name !== `Chat ${room.id?.slice(-5)}`) {
            return room.name;
        }

        return room.lastMessageSnippet &&
            room.lastMessageSnippet !== "No messages yet"
            ? room.lastMessageSnippet.slice(0, 30) + "..."
            : `Patient Consultation ${room.id?.slice(-5) || "New"}`;
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

    const handleSearchClick = () => {
        setIsSearchModalOpen(true);
    };

    const handleSearchModalClose = () => {
        setIsSearchModalOpen(false);
    };

    const handleSearchChatSelect = (chatId) => {
        if (onSelectRoom) {
            onSelectRoom(chatId);
        }
        if (isMobile && isOpen) {
            onToggle();
        }
    };

    const handleLogout = () => {
        try {
            Cookies.remove("user");
            dispatch({ type: "LOGOUT" });
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
            navigate("/login");
        }
    };

    const handleRoomSelect = (roomId) => {
        if (onSelectRoom) {
            onSelectRoom(roomId);
        }
        if (isMobile && isOpen) {
            onToggle();
        }
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setActiveDropdown(null);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Healthcare Icons
    const HealthcareIcon = ({ type = "default" }) => {
        const icons = {
            consultation: (
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            ),
            search: (
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
            stethoscope: (
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
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                </svg>
            ),
            patient: (
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
            ),
        };
        return icons[type] || icons.default;
    };

    return (
        <>
            <div
                className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "w-72" : "w-16"
                } bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-r border-emerald-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 flex flex-col overflow-hidden relative shadow-lg`}
            >
                {/* Medical Header */}
                <div className="px-4 py-5 flex-shrink-0 relative flex items-center justify-center border-b border-emerald-100 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70">
                    <button
                        onClick={onToggle}
                        className={`${
                            isOpen ? "absolute left-4" : ""
                        } p-2 hover:bg-emerald-100 dark:hover:bg-slate-700 rounded-lg transition-colors z-10 text-emerald-700 dark:text-emerald-400`}
                        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {isOpen ? (
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
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        ) : (
                            <HealthcareIcon type="stethoscope" />
                        )}
                    </button>

                    {isOpen && (
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                                    <img
                                        src="/logo.png"
                                        alt="HealthCare AI Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent">
                                    HealthCare AI
                                </h1>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-3 px-4 py-4">
                    <button
                        onClick={handleStartNewChat}
                        className={`w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 dark:from-emerald-700 dark:to-emerald-800 dark:hover:from-emerald-800 dark:hover:to-emerald-900 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg touch-manipulation ${
                            isOpen
                                ? "px-4 py-3 flex items-center gap-3"
                                : "p-3 flex items-center justify-center"
                        }`}
                        title={!isOpen ? "New Consultation" : ""}
                    >
                        <HealthcareIcon type="consultation" />
                        {isOpen && <span>New Consultation</span>}
                    </button>

                    <button
                        onClick={handleSearchClick}
                        className={`w-full bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 hover:border-emerald-300 dark:border-slate-600 dark:hover:border-emerald-500 rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md touch-manipulation ${
                            isOpen
                                ? "px-4 py-3 flex items-center gap-3"
                                : "p-3 flex items-center justify-center"
                        }`}
                        title={!isOpen ? "Search Patient Records" : ""}
                    >
                        <HealthcareIcon type="search" />
                        {isOpen && <span>Search Past Consultations</span>}
                    </button>
                </div>

                {/* Patient Sessions */}
                {isOpen && (
                    <div className="flex-1 overflow-y-auto px-4 pb-4">
                        {sortedChatRooms.length > 0 && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4 px-2">
                                    <HealthcareIcon type="patient" />
                                    Recent Consultations
                                </div>
                                <div className="space-y-2">
                                    {sortedChatRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className={`relative group rounded-lg transition-all duration-200 ${
                                                activeRoomId === room.id
                                                    ? "bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 shadow-sm"
                                                    : "hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
                                            } cursor-pointer`}
                                        >
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() =>
                                                        handleRoomSelect(
                                                            room.id
                                                        )
                                                    }
                                                    className="flex-1 text-left px-3 py-4 text-sm transition-colors flex items-center gap-3 min-w-0 touch-manipulation"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <span
                                                            className={`truncate block font-medium ${
                                                                activeRoomId ===
                                                                room.id
                                                                    ? "text-emerald-800 dark:text-emerald-300"
                                                                    : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                                                            }`}
                                                        >
                                                            {formatChatName(
                                                                room
                                                            )}
                                                        </span>
                                                        {room.lastMessageTime && (
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                                                {new Date(
                                                                    room.lastMessageTime
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        month: "short",
                                                                        day: "numeric",
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </span>
                                                        )}
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
                                                        className={`p-2 mr-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-all duration-200 touch-manipulation ${
                                                            isMobile
                                                                ? "opacity-100"
                                                                : "opacity-0 group-hover:opacity-100"
                                                        }`}
                                                    >
                                                        <svg
                                                            className="w-4 h-4 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>

                                                    {activeDropdown ===
                                                        room.id && (
                                                        <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg z-10 overflow-hidden">
                                                            <button
                                                                onClick={(e) =>
                                                                    handleRename(
                                                                        room,
                                                                        e
                                                                    )
                                                                }
                                                                className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
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
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                                Rename Session
                                                            </button>
                                                            <div className="border-t border-slate-100 dark:border-slate-600">
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleDelete(
                                                                            room.id,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
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
                                                                            strokeWidth={
                                                                                2
                                                                            }
                                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                        />
                                                                    </svg>
                                                                    Delete
                                                                    Session
                                                                </button>
                                                            </div>
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

                {/* Medical Professional Profile */}
                <div className="p-4 border-t border-emerald-100 dark:border-slate-700 mt-auto bg-white/50 dark:bg-slate-800/50">
                    <div className="relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className={`w-full hover:bg-white/70 dark:hover:bg-slate-700/70 rounded-lg transition-colors text-sm border border-transparent hover:border-emerald-200 dark:hover:border-slate-600 ${
                                isOpen
                                    ? "flex items-center gap-3 p-3"
                                    : "p-3 flex items-center justify-center"
                            }`}
                            title={!isOpen ? displayName : ""}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm">
                                {displayInitial}
                            </div>
                            {isOpen && (
                                <>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            {displayName}
                                        </div>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform flex-shrink-0 ${
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

                        {isUserMenuOpen && isOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-lg overflow-hidden">
                                <button
                                    className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate("/settings/profile");
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
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    Settings
                                </button>

                                <div className="border-t border-slate-100 dark:border-slate-600">
                                    <button
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                                        onClick={handleLogout}
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

            {/* Modals */}
            <ConversationModal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                type={modalState.type}
                chatName={modalState.roomName}
                onRename={handleModalRename}
                onDelete={handleModalDelete}
            />

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
