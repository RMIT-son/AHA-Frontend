import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import ConversationModal from "./ConversationModal";
import SearchChatModal from "./SearchChatModal";
import Cookies from "js-cookie";

const MobileSidebar = ({
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

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const displayName = user?.fullName || user?.name || "Dr. Assistant";
    const displayInitial = displayName.charAt(0).toUpperCase();
    const userRole = user?.role || "Healthcare AI";

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
        onToggle(); // Close sidebar after selection
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
        onToggle(); // Close sidebar after selection
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
        onToggle(); // Close sidebar after selection
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
            close: (
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
            ),
        };
        return icons[type] || icons.default;
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 z-40 transition-opacity duration-300 ease-in-out md:hidden ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={onToggle}
                style={{
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                }}
            />

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 w-80 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                style={{ height: "100vh" }}
            >
                <div className="h-full bg-gradient-to-b from-slate-50 to-emerald-50 text-slate-800 flex flex-col overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="px-4 py-5 flex-shrink-0 border-b border-emerald-100 bg-white/70">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
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
                                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                                    HealthCare AI
                                </h1>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-700"
                            >
                                <HealthcareIcon type="close" />
                            </button>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleStartNewChat}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl px-4 py-4 flex items-center gap-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation"
                            >
                                <HealthcareIcon type="consultation" />
                                <span>New Consultation</span>
                            </button>

                            <button
                                onClick={handleSearchClick}
                                className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-emerald-300 rounded-xl px-4 py-4 flex items-center gap-3 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 touch-manipulation"
                            >
                                <HealthcareIcon type="search" />
                                <span>Search Past Consultations</span>
                            </button>
                        </div>
                    </div>

                    {/* Patient Sessions */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {sortedChatRooms.length > 0 && (
                            <>
                                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4 px-2">
                                    <HealthcareIcon type="patient" />
                                    Recent Consultations
                                </div>
                                <div className="space-y-2">
                                    {sortedChatRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className={`relative group rounded-lg transition-all duration-200 ${
                                                activeRoomId === room.id
                                                    ? "bg-emerald-100 border border-emerald-200 shadow-sm"
                                                    : "hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
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
                                                                    ? "text-emerald-800"
                                                                    : "text-slate-700 group-hover:text-slate-900"
                                                            }`}
                                                        >
                                                            {formatChatName(
                                                                room
                                                            )}
                                                        </span>
                                                        {room.lastMessageTime && (
                                                            <span className="text-xs text-slate-500 mt-1 block">
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
                                                        className="p-3 mr-2 hover:bg-slate-200 rounded-lg transition-all duration-200 touch-manipulation"
                                                    >
                                                        <svg
                                                            className="w-4 h-4 text-slate-500 hover:text-slate-700"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>

                                                    {activeDropdown ===
                                                        room.id && (
                                                        <div className="absolute right-0 top-12 w-56 bg-white rounded-lg border border-slate-200 shadow-xl z-10 overflow-hidden">
                                                            <button
                                                                onClick={(e) =>
                                                                    handleRename(
                                                                        room,
                                                                        e
                                                                    )
                                                                }
                                                                className="w-full text-left px-4 py-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 touch-manipulation"
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
                                                            <div className="border-t border-slate-100">
                                                                <button
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        handleDelete(
                                                                            room.id,
                                                                            e
                                                                        )
                                                                    }
                                                                    className="w-full text-left px-4 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 touch-manipulation"
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

                    {/* Medical Professional Profile */}
                    <div className="p-4 border-t border-emerald-100 bg-white/50 flex-shrink-0">
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setIsUserMenuOpen(!isUserMenuOpen)
                                }
                                className="w-full hover:bg-white/70 rounded-lg transition-colors text-sm border border-transparent hover:border-emerald-200 flex items-center gap-3 p-3 touch-manipulation"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm">
                                    {displayInitial}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="font-semibold text-slate-800 truncate text-base">
                                        {displayName}
                                    </div>
                                    <div className="text-sm text-slate-600 truncate">
                                        {userRole}
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
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

                            {isUserMenuOpen && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden">
                                    <button
                                        className="w-full text-left px-4 py-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 touch-manipulation"
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            navigate("/settings/profile");
                                            onToggle();
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
                                        Medical Settings
                                    </button>

                                    <div className="border-t border-slate-100">
                                        <button
                                            className="w-full text-left px-4 py-4 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-3 touch-manipulation"
                                            onClick={() => {
                                                setIsUserMenuOpen(false);
                                                onToggle();
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
                                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Help & Documentation
                                        </button>
                                    </div>

                                    <div className="border-t border-slate-100">
                                        <button
                                            className="w-full text-left px-4 py-4 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 touch-manipulation"
                                            onClick={() => {
                                                handleLogout();
                                                onToggle();
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

export default MobileSidebar;
