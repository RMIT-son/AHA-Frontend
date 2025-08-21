import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components";
import { renameConversation, deleteConversation } from "../controllers/chat";

const ChatLayout = ({
    children,
    activeRoomId = null,
    headerTitle = "Chat",
    chatRooms = [], // Accept chatRooms from parent (ChatPage)
    user = null, // Accept user from parent
    onChatRoomsUpdate = null, // Callback to notify parent of changes
}) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);

    // Check if device is mobile and handle initial sidebar state
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // On desktop, sidebar should be open by default
            // On mobile, sidebar should be closed by default
            if (!mobile) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleRenameRoom = async (roomId, newName) => {
        try {
            await renameConversation(roomId, newName);

            // Notify parent component to refresh the conversation list
            if (onChatRoomsUpdate) {
                await onChatRoomsUpdate();
            }
        } catch (error) {
            console.error("Error renaming conversation:", error);
            alert("Failed to rename conversation. Please try again.");
            throw error;
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteConversation(roomId, user?.id);

            // Notify parent component to refresh the conversation list
            if (onChatRoomsUpdate) {
                await onChatRoomsUpdate();
            }

            // If the deleted room is currently active, navigate away
            if (activeRoomId === roomId) {
                navigate("/", { replace: true });
            }
        } catch (error) {
            console.error("Error deleting conversation:", error);
            alert("Failed to delete conversation. Please try again.");
            throw error;
        }
    };

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleRoomSelect = (roomId) => {
        // On mobile, close sidebar after selecting a room
        if (isMobile) {
            setIsSidebarOpen(false);
        }

        navigate(roomId && roomId !== "undefined" ? `/chat/${roomId}` : "/");
    };

    return (
        <div className="flex h-screen bg-white relative">
            {/* Mobile Overlay - Blur the chat content behind */}
            {isMobile && (
                <div
                    className={`fixed inset-0  z-40 transition-opacity duration-300 ease-in-out ${
                        isSidebarOpen
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        backdropFilter: "blur(4px)",
                        WebkitBackdropFilter: "blur(4px)",
                    }}
                />
            )}

            {/* Chat Sidebar - On mobile: fixed overlay, On desktop: normal flow */}
            {isMobile ? (
                // Mobile: Fixed positioned sidebar with smooth transitions
                <>
                    <div
                        className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
                            isSidebarOpen
                                ? "translate-x-0"
                                : "-translate-x-full"
                        }`}
                        style={{ height: "100vh" }}
                    >
                        <div className="h-full bg-gray-800 text-white flex flex-col overflow-hidden">
                            {/* Mobile Sidebar Header */}
                            <div className="px-3 py-4 flex-shrink-0">
                                <div className="flex items-center gap-2 mb-6">
                                    <button
                                        onClick={handleSidebarToggle}
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
                                    <span className="text-white font-medium text-sm truncate">
                                        AI Healthcare Assistant
                                    </span>
                                </div>

                                {/* Mobile Buttons */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleRoomSelect(null)}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-3 py-3 flex items-center gap-2 text-sm font-medium touch-manipulation transition-colors"
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
                                        New chat
                                    </button>

                                    <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-3 flex items-center gap-2 text-sm font-medium touch-manipulation transition-colors">
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
                                        Search chats
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Chat List */}
                            <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
                                {chatRooms.length > 0 && (
                                    <>
                                        <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-2">
                                            Recents
                                        </div>
                                        <div className="space-y-1">
                                            {[...chatRooms]
                                                .sort((a, b) => {
                                                    if (
                                                        a.lastMessageTime &&
                                                        b.lastMessageTime
                                                    ) {
                                                        return (
                                                            new Date(
                                                                b.lastMessageTime
                                                            ) -
                                                            new Date(
                                                                a.lastMessageTime
                                                            )
                                                        );
                                                    }
                                                    if (
                                                        a.createdAt &&
                                                        b.createdAt
                                                    ) {
                                                        return (
                                                            new Date(
                                                                b.createdAt
                                                            ) -
                                                            new Date(
                                                                a.createdAt
                                                            )
                                                        );
                                                    }
                                                    if (a.id && b.id) {
                                                        return b.id.localeCompare(
                                                            a.id
                                                        );
                                                    }
                                                    return 0;
                                                })
                                                .map((room) => {
                                                    const formatChatName = (
                                                        room
                                                    ) => {
                                                        if (
                                                            room.title &&
                                                            room.title.trim() !==
                                                                ""
                                                        ) {
                                                            return room.title;
                                                        }
                                                        if (
                                                            room.name &&
                                                            room.name !==
                                                                `Chat ${room.id?.slice(
                                                                    -5
                                                                )}`
                                                        ) {
                                                            return room.name;
                                                        }
                                                        return room.lastMessageSnippet &&
                                                            room.lastMessageSnippet !==
                                                                "No messages yet"
                                                            ? room.lastMessageSnippet.slice(
                                                                  0,
                                                                  30
                                                              ) + "..."
                                                            : `Chat ${
                                                                  room.id?.slice(
                                                                      -5
                                                                  ) || "New"
                                                              }`;
                                                    };

                                                    return (
                                                        <div
                                                            key={room.id}
                                                            className={`relative group rounded-md transition-colors ${
                                                                activeRoomId ===
                                                                room.id
                                                                    ? "bg-gray-700"
                                                                    : "hover:bg-gray-700"
                                                            }`}
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    handleRoomSelect(
                                                                        room.id
                                                                    )
                                                                }
                                                                className="w-full text-left px-2 py-3 text-sm transition-colors flex items-center gap-2 min-w-0 touch-manipulation"
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
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile User Profile */}
                            <div className="p-3 border-t border-gray-700 flex-shrink-0">
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setMobileUserMenuOpen(
                                                !mobileUserMenuOpen
                                            )
                                        }
                                        className="w-full hover:bg-gray-700 rounded-md transition-colors text-sm flex items-center gap-2 p-2"
                                    >
                                        <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                            {user?.fullName
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                user?.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() ||
                                                "U"}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="font-medium text-white truncate">
                                                {user?.fullName ||
                                                    user?.name ||
                                                    "User"}
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                                                mobileUserMenuOpen
                                                    ? "rotate-180"
                                                    : ""
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

                                    {/* Mobile User Dropdown Menu */}
                                    {mobileUserMenuOpen && (
                                        <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-700 rounded-md border border-gray-600 shadow-lg overflow-hidden">
                                            <button
                                                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
                                                onClick={() => {
                                                    setMobileUserMenuOpen(
                                                        false
                                                    );
                                                    navigate(
                                                        "/settings/profile"
                                                    );
                                                    setIsSidebarOpen(false); // Close sidebar after navigation
                                                }}
                                            >
                                                Settings
                                            </button>

                                            <div className="border-t border-gray-600">
                                                <button
                                                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-600 transition-colors"
                                                    onClick={() => {
                                                        setMobileUserMenuOpen(
                                                            false
                                                        );
                                                        // Handle logout - simple version for mobile
                                                        navigate("/login");
                                                        setIsSidebarOpen(false);
                                                    }}
                                                >
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                // Desktop: Normal positioned sidebar (UNCHANGED)
                <Sidebar
                    isOpen={isSidebarOpen}
                    chatRooms={chatRooms}
                    activeRoomId={activeRoomId}
                    onSelectRoom={(roomId) =>
                        navigate(
                            roomId && roomId !== "undefined"
                                ? `/chat/${roomId}`
                                : "/"
                        )
                    }
                    onRenameRoom={handleRenameRoom}
                    onDeleteRoom={handleDeleteRoom}
                    onToggle={handleSidebarToggle}
                    onRefresh={onChatRoomsUpdate}
                    user={user}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
                {/* Header */}
                {headerTitle && (
                    <div className="h-12 sm:h-14 border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-white flex-shrink-0 relative z-10">
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Mobile Menu Button */}
                            {isMobile && (
                                <button
                                    onClick={handleSidebarToggle}
                                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                    aria-label="Toggle sidebar"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-600"
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

                            <div className="flex items-center gap-2">
                                <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                    {headerTitle}
                                </span>
                            </div>
                        </div>

                        {/* Optional: Add user info or other header elements */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* You can add user avatar, settings, etc. here */}
                        </div>
                    </div>
                )}

                {/* Children Content */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ChatLayout;
