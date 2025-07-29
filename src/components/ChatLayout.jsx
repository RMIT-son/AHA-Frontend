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

    return (
        <div className="flex h-screen bg-white">
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
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                {headerTitle && (
                    <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gray-900">
                                    {headerTitle}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Children Content */}
                {children}
            </div>
        </div>
    );
};

export default ChatLayout;
