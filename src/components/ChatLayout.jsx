import { useState } from "react";
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
        
        navigate(
            roomId && roomId !== "undefined"
                ? `/chat/${roomId}`
                : "/"
        );
    };

    return (
        <div className="flex h-screen bg-white relative">
            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            {/* Chat Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                chatRooms={chatRooms} // Use chatRooms from parent
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
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onRefresh={onChatRoomsUpdate} // Use callback from parent
                user={user} // Use user from parent
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 w-full">
                {/* Header */}
                {headerTitle && (
                    <div className="h-12 sm:h-14 border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-white flex-shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                    
                            

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
