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
import { getUserProfile } from "../controllers/user";

const SettingsPage = ({ section }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentSection = section || location.pathname.split("/").pop();

    // Add state for user and chatRooms
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [userLoading, setUserLoading] = useState(true);

    // Cookie authentication check and fetch fresh user data
    useEffect(() => {
        const initializeUser = async () => {
            const userCookie = Cookies.get("user");
            if (!userCookie) {
                alert("Please log in to access the settings.");
                navigate("/login");
                return;
            }

            try {
                const userData = JSON.parse(userCookie);
                setUserId(userData.id);

                // Always fetch fresh user data from database
                try {
                    const freshUserData = await getUserProfile();
                    setUser(freshUserData);
                } catch (error) {
                    console.error("Failed to fetch fresh user data:", error);
                    // Fallback to cookie data if API fails
                    setUser(userData);
                }
            } catch (err) {
                console.error("❌ Failed to parse user cookie:", err);
                navigate("/login");
            } finally {
                setUserLoading(false);
            }
        };

        initializeUser();
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

    // Function to refresh user data after updates
    const refreshUserData = async () => {
        try {
            const freshUserData = await getUserProfile();
            setUser(freshUserData);
            return freshUserData;
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            throw error;
        }
    };

    // Pass user data and refresh function to all components
    const views = {
        profile: <Profile user={user} onUserUpdate={refreshUserData} />,
        appearance: <Appearance user={user} onUserUpdate={refreshUserData} />,
        account: <Account user={user} onUserUpdate={refreshUserData} />,
    };

    // Show loading state while fetching user data
    if (userLoading || !user) {
        return (
            <ChatLayout
                headerTitle="Settings"
                chatRooms={[]}
                user={null}
                onChatRoomsUpdate={() => {}}
            >
                <div className="flex-1 overflow-hidden">
                    {/* Responsive padding */}
                    <div className="h-full py-4 px-4 sm:py-8 sm:px-8 lg:py-40 lg:px-40">
                        <div className="w-full max-w-7xl mx-auto h-full">
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-pulse text-gray-500">
                                    Loading settings...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ChatLayout>
        );
    }

    return (
        <ChatLayout
            headerTitle="Settings"
            chatRooms={chatRooms}
            user={user}
            onChatRoomsUpdate={refreshConversationList}
        >
            <div className="flex-1 overflow-hidden">
                {/* Responsive padding and container */}
                <div className="h-full py-6 px-4 sm:py-10 sm:px-8 lg:py-16 lg:px-16 xl:py-24 xl:px-32 bg-[#1f232b] text-gray-200">
                    <div className="w-full max-w-7xl mx-auto h-full">
                        {/* Sidebar and Main content container */}
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
                            {/* Settings Sidebar - Always visible */}
                            <div className="w-full lg:w-64 lg:flex-shrink-0">
                                <div className="lg:sticky lg:top-0">
                                    <SettingsPageSidebar
                                        activeSection={currentSection}
                                    />
                                </div>
                            </div>

                            {/* Main content - Responsive */}
                            <div className="flex-1 min-w-0 lg:ml-4">
                                <div className="h-full overflow-y-auto">
                                    {views[currentSection] || views.profile}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ChatLayout>
    );
};

export default SettingsPage;
