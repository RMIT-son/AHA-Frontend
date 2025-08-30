import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Sidebar, MobileSidebar, SearchChatModal } from "../components";
import { renameConversation, deleteConversation } from "../controllers/chat";

const ChatLayout = ({
    children,
    activeRoomId = null,
    headerTitle = "",
    chatRooms = [],
    user = null,
    onChatRoomsUpdate = null,
}) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Mobile detection and sidebar state management
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setIsSidebarOpen(!mobile); // Open on desktop, closed on mobile
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Room management handlers
    const handleRenameRoom = async (roomId, newName) => {
        try {
            await renameConversation(roomId, newName);
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
            if (onChatRoomsUpdate) {
                await onChatRoomsUpdate();
            }
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
        navigate(roomId && roomId !== "undefined" ? `/chat/${roomId}` : "/");
    };

    const handleSearchClick = () => {
        setIsSearchModalOpen(true);
    };

    const handleSearchModalClose = () => {
        setIsSearchModalOpen(false);
    };

    const handleSearchChatSelect = (chatId) => {
        handleRoomSelect(chatId);
        setIsSearchModalOpen(false);
    };

    return (
        <div className="flex h-screen bg-white dark:bg-neutral-900 relative transition-colors duration-200">
            {/* Sidebar - Conditionally render Mobile or Desktop */}
            {isMobile ? (
                <MobileSidebar
                    isOpen={isSidebarOpen}
                    chatRooms={chatRooms}
                    activeRoomId={activeRoomId}
                    onSelectRoom={handleRoomSelect}
                    onRenameRoom={handleRenameRoom}
                    onDeleteRoom={handleDeleteRoom}
                    onToggle={handleSidebarToggle}
                    user={user}
                />
            ) : (
                <Sidebar
                    isOpen={isSidebarOpen}
                    chatRooms={chatRooms}
                    activeRoomId={activeRoomId}
                    onSelectRoom={handleRoomSelect}
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
                    <div className="h-12 sm:h-14 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-white dark:bg-neutral-900 flex-shrink-0 relative z-10 transition-colors duration-200">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            {/* Mobile Menu Button */}
                            {isMobile && (
                                <button
                                    onClick={handleSidebarToggle}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors flex-shrink-0"
                                    aria-label="Toggle sidebar"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
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

                            {/* Title Container with proper truncation */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {headerTitle}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Additional header elements can go here */}
                        </div>
                    </div>
                )}

                {/* Page Content */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {children}
                </div>
            </div>

            {/* Search Modal */}
            <SearchChatModal
                isOpen={isSearchModalOpen}
                onClose={handleSearchModalClose}
                onSelectChat={handleSearchChatSelect}
                user={user}
            />
        </div>
    );
};

export default ChatLayout;
