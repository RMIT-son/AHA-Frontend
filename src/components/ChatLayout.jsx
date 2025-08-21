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
            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Chat Sidebar - On mobile: fixed overlay, On desktop: normal flow */}
            {isMobile ? (
                // Mobile: Fixed positioned sidebar
                isSidebarOpen && (
                    <div className="fixed left-0 top-0 h-screen w-64 z-50">
                        <Sidebar
                            isOpen={true}
                            chatRooms={chatRooms}
                            activeRoomId={activeRoomId}
                            onSelectRoom={handleRoomSelect}
                            onRenameRoom={handleRenameRoom}
                            onDeleteRoom={handleDeleteRoom}
                            onToggle={handleSidebarToggle}
                            onRefresh={onChatRoomsUpdate}
                            user={user}
                        />
                    </div>
                )
            ) : (
                // Desktop: Normal positioned sidebar
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
