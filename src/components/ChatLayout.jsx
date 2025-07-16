import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Sidebar } from "../components";
import {
    getAllConversations,
    renameConversation,
    deleteConversation,
} from "../controllers/chat";

const ChatLayout = ({
    children,
    activeRoomId = null,
    headerTitle = "Chat",
}) => {
    const navigate = useNavigate();

    // Chat-related state for the sidebar
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Cookie authentication check and set userId
    useEffect(() => {
        const userCookie = Cookies.get("user");
        if (!userCookie) {
            alert("Please log in to access this page.");
            navigate("/login");
            return;
        }
        try {
            const userData = JSON.parse(userCookie);
            setUserId(userData.id);
            setUser(userData);
        } catch (err) {
            console.error("❌ Failed to parse user cookie:", err);
            navigate("/login");
        }
    }, [navigate]);

    // Load conversations for the sidebar
    useEffect(() => {
        if (userId) {
            refreshConversationList();
        }
    }, [userId]);

    const refreshConversationList = async (uid = userId) => {
        if (!uid) return;
        try {
            const allConversations = await getAllConversations(uid);
            console.log("Fetched conversations:", allConversations);

            const list = allConversations.map((chat) => ({
                id: chat.id,
                name:
                    chat.title || `Chat ${chat.id ? chat.id.slice(-5) : "New"}`,
                title: chat.title,
                lastMessageSnippet:
                    chat.messages && chat.messages.length > 0
                        ? chat.messages[
                              chat.messages.length - 1
                          ]?.content?.slice(0, 30) + "..."
                        : "No messages yet",
            }));

            console.log("Loaded conversations:", list);

            setChatRooms(list);
        } catch (error) {
            console.error("Error refreshing conversation list:", error);
        }
    };

    const handleRenameRoom = async (roomId, newName) => {
        try {
            const updatedConversation = await renameConversation(
                roomId,
                newName
            );

            setChatRooms((prev) =>
                prev.map((room) =>
                    room.id === roomId
                        ? { ...room, name: newName, title: newName }
                        : room
                )
            );

            console.log(`Renamed room ${roomId} to ${newName}`);
            return updatedConversation;
        } catch (error) {
            console.error("Error renaming conversation:", error);
            alert("Failed to rename conversation. Please try again.");
            throw error;
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            await deleteConversation(roomId, userId);

            setChatRooms((prev) => prev.filter((room) => room.id !== roomId));

            // If the deleted room is currently active, navigate away
            if (activeRoomId === roomId) {
                navigate("/", { replace: true });
            }

            console.log(`Deleted room ${roomId}`);
        } catch (error) {
            console.error("Error deleting conversation. Please try again.");
            alert("Failed to delete conversation. Please try again.");
            throw error;
        }
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Chat Sidebar */}
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
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                onRefresh={() => refreshConversationList()}
                user={user}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                                {headerTitle}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Children Content */}
                {children}
            </div>
        </div>
    );
};

export default ChatLayout;
