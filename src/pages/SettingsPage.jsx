import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../hooks"; // Add this import
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
    const { theme } = useTheme();
    const currentSection = section || location.pathname.split("/").pop();

    // Use the same auth pattern as ChatPage
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    useAuth(navigate, setUserId, setUser); // This handles all authentication

    const [chatRooms, setChatRooms] = useState([]);
    const [userLoading, setUserLoading] = useState(true);
    const [error, setError] = useState("");

    // Wait for useAuth to load user data
    useEffect(() => {
        if (user) {
            setUserLoading(false);
        }
    }, [user]);

    // Load conversations for sidebar when user is available
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
                updatedAt: chat.updatedAt || chat.created_at,
                messageCount: chat.messages ? chat.messages.length : 0,
            }));

            // Sort by most recent first
            list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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
            setError("");
            const freshUserData = await getUserProfile();
            setUser(freshUserData);
            return freshUserData;
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            setError(
                "Failed to refresh user data. Some changes may not be visible."
            );
            throw error;
        }
    };

    // Handle section navigation
    const handleSectionChange = (newSection) => {
        navigate(`/settings/${newSection}`);
    };

    // Pass user data and refresh function to all components
    const views = {
        profile: (
            <Profile
                user={user}
                onUserUpdate={refreshUserData}
                onError={setError}
            />
        ),
        appearance: (
            <Appearance
                user={user}
                onUserUpdate={refreshUserData}
                onError={setError}
            />
        ),
        account: (
            <Account
                user={user}
                onUserUpdate={refreshUserData}
                onError={setError}
            />
        ),
    };

    // Show loading state while useAuth is loading user data
    if (userLoading || !user) {
        return (
            <ChatLayout
                headerTitle="Settings"
                chatRooms={[]}
                user={null}
                onChatRoomsUpdate={() => {}}
                theme={theme}
            >
                <div className="flex-1 overflow-hidden">
                    <div className="h-full py-4 px-4 sm:py-8 sm:px-8 lg:py-40 lg:px-40 bg-white dark:bg-[#1f232b] transition-colors duration-200">
                        <div className="w-full max-w-7xl mx-auto h-full">
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
                                    <div className="animate-pulse text-gray-500 dark:text-gray-400">
                                        Loading settings...
                                    </div>
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
            theme={theme}
        >
            <div className="flex-1 overflow-hidden">
                {/* Global error message */}
                {error && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700 px-4 py-3">
                        <div className="flex items-center max-w-7xl mx-auto">
                            <svg
                                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-yellow-800 dark:text-yellow-300 text-sm">
                                {error}
                            </span>
                            <button
                                onClick={() => setError("")}
                                className="ml-auto text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main settings content with theme-aware styling */}
                <div className="h-full py-6 px-4 sm:py-10 sm:px-8 lg:py-16 lg:px-16 xl:py-16 xl:px-32 bg-white dark:bg-[#1f232b] text-gray-900 dark:text-gray-200 transition-colors duration-200">
                    <div className="w-full max-w-7xl mx-auto h-full">
                        {/* Breadcrumb navigation */}
                        <div className="mb-6">
                            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <button
                                    onClick={() => navigate("/chat")}
                                    className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                                >
                                    Chat
                                </button>
                                <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-300 capitalize">
                                    Settings
                                </span>
                                {currentSection &&
                                    currentSection !== "settings" && (
                                        <>
                                            <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                                                {currentSection}
                                            </span>
                                        </>
                                    )}
                            </nav>
                        </div>

                        {/* Sidebar and Main content container */}
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-full">
                            {/* Settings Sidebar - Always visible with enhanced styling */}
                            <div className="w-full lg:w-64 lg:flex-shrink-0">
                                <div className="lg:sticky lg:top-0">
                                    <div className="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-2 shadow-sm">
                                        <SettingsPageSidebar
                                            activeSection={currentSection}
                                            onSectionChange={
                                                handleSectionChange
                                            }
                                            user={user}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Main content - Responsive with enhanced styling */}
                            <div className="flex-1 min-w-0">
                                <div className="h-full">
                                    {/* Content wrapper with proper scrolling */}
                                    <div className="h-full overflow-y-auto">
                                        <div className="min-h-full">
                                            {/* Section header */}
                                            <div className="mb-6">
                                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 capitalize">
                                                    {currentSection ===
                                                    "settings"
                                                        ? "Profile"
                                                        : currentSection}
                                                </h1>
                                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                    {currentSection ===
                                                        "profile" &&
                                                        "Manage your profile information and preferences"}
                                                    {currentSection ===
                                                        "appearance" &&
                                                        "Customize your chat interface and theme"}
                                                    {currentSection ===
                                                        "account" &&
                                                        "Manage your account settings and security"}
                                                </p>
                                            </div>

                                            {/* Dynamic content based on section */}
                                            <div className="pb-8">
                                                {views[currentSection] ||
                                                    views.profile}
                                            </div>
                                        </div>
                                    </div>
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
