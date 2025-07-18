import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
    Account,
    Profile,
    Appearance,
    SettingsPageSidebar,
    ChatLayout,
} from "../components";
import { getAllConversations } from "../controllers/chat";

const SettingsPage = ({ section }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentSection = section || location.pathname.split("/").pop();

    // Add state for user and chatRooms
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);

    // Cookie authentication check and set userId
    useEffect(() => {
        const userCookie = Cookies.get("user");
        if (!userCookie) {
            alert("Please log in to access the settings.");
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

    // Load conversations for sidebar
    const refreshConversationList = async (uid = userId) => {
        if (!uid) return;
        try {
            const allConversations = await getAllConversations(uid);
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
            setChatRooms(list);
        } catch (error) {
            console.error("Error refreshing conversation list:", error);
        }
    };

    // Load conversations when userId is available
    useEffect(() => {
        if (userId) {
            refreshConversationList(userId);
        }
    }, [userId]);

    const views = {
        profile: <Profile />,
        appearance: <Appearance />,
        account: <Account />,
    };

    return (
        <ChatLayout
            headerTitle="Settings"
            chatRooms={chatRooms}
            user={user}
            onChatRoomsUpdate={refreshConversationList}
        >
            <div className="flex-1 overflow-hidden">
                <div className="h-full py-40 px-40">
                    <div className="w-full max-w-7xl mx-auto h-full">
                        {/* Sidebar and Main content container */}
                        <div className="flex gap-2 h-full">
                            {/* Settings Sidebar */}
                            <SettingsPageSidebar
                                activeSection={currentSection}
                            />

                            {/* Main content */}
                            <div className="flex-1 ml-4">
                                {views[currentSection] || <Profile />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatLayout>
    );
};

export default SettingsPage;
