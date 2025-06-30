import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ChatWindow, ChatInput, Sidebar } from "../components";
import {
    createConversation,
    getConversationById,
    getAllConversations,
    streamFromBackend
} from "../controllers/chat";

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const skipNextLoadRef = useRef(null);

    const [userId, setUserId] = useState(null);
    const [chatId, setChatId] = useState(id || null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoadingInput, setIsLoadingInput] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Cookie authentication check and set userId
    useEffect(() => {
        const userCookie = Cookies.get("user");
        if (!userCookie) {
            alert("Please log in to access the chat.");
            navigate("/login");
            return;
        }
        try {
            const user = JSON.parse(userCookie);
            setUserId(user.id);
        } catch (err) {
            console.error("❌ Failed to parse user cookie:", err);
            navigate("/login");
        }
    }, [navigate]);

    // Load chat data when ID or userId changes
    useEffect(() => {
        const loadChatData = async () => {
            if (!userId) return;
            try {
                if (id && id === skipNextLoadRef.current) {
                    skipNextLoadRef.current = null;
                    return;
                }
                if (id === "new" || !id) {
                    setChatId(null);
                    setMessages([]);
                } else if (id && id !== "undefined") {
                    const res = await getConversationById(id);
                    if (res && res.messages) {
                        setChatId(id);
                        // Normalize sender values to match frontend expectations
                        const normalizedMessages = res.messages.map(msg => {
                            // Convert "assistant" to "bot" for frontend consistency
                            const sender = msg.sender === "assistant" ? "bot" : msg.sender;
                            return { ...msg, sender };
                        });
                        setMessages(normalizedMessages);
                    } else {
                        setChatId(null);
                        setMessages([]);
                    }
                }
                await refreshConversationList(userId);
                setHasLoaded(true);
            } catch (error) {
                console.error("Error loading chat data:", error);
            }
        };

        loadChatData();
    }, [id, userId]);

    const refreshConversationList = async (uid = userId) => {
        if (!uid) return;
        try {
            const allConversations = await getAllConversations(uid);
            const list = allConversations.map((chat) => ({
                id: chat.id,
                name: `Chat ${chat.id ? chat.id.slice(-5) : "New"}`,
                lastMessageSnippet:
                    chat.messages && chat.messages.length > 0
                        ? chat.messages[chat.messages.length - 1]?.content?.slice(0, 30) + "..."
                        : "No messages yet",
            }));
            setChatRooms(list);
        } catch (error) {
            console.error("Error refreshing conversation list:", error);
        }
    };

    const handleSend = async (text) => {
        setIsLoadingInput(true);
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(),
            status: "pending",
        };

        try {
            let currentChatId = chatId;
            if (!currentChatId || currentChatId === "undefined" || currentChatId === "new") {
                const newChat = await createConversation(userId);
                currentChatId = newChat.id;
                setChatId(newChat.id);
                skipNextLoadRef.current = newChat.id;
                navigate(`/chat/${newChat.id}`);
            }

            setMessages((prev) => [...prev, tempUserMessage]);
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let botMessageId = null;
            let isFirstChunk = true;

            await streamFromBackend(currentChatId, text, userId, (chunk) => {
                if (isFirstChunk) {
                    setIsBotTyping(false);
                    isFirstChunk = false;
                }
                setMessages((prev) => {
                    const updated = [...prev];
                    const botIndex = updated.findIndex((msg) => msg.tempId === botMessageId);
                    if (botIndex !== -1) {
                        updated[botIndex] = {
                            ...updated[botIndex],
                            content: updated[botIndex].content + chunk,
                        };
                    } else {
                        botMessageId = Date.now();
                        // Use "bot" instead of "assistant" for frontend consistency
                        updated.push({
                            sender: "bot",
                            content: chunk,
                            timestamp: new Date().toISOString(),
                            tempId: botMessageId,
                        });
                    }
                    return updated;
                });
            });

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === tempUserMessage.tempId ? { ...msg, status: "delivered" } : msg
                )
            );

            await refreshConversationList();
        } catch (err) {
            console.error("Error sending message:", err);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === tempUserMessage.tempId
                        ? { ...msg, status: "failed", error: err.message }
                        : msg
                )
            );
            setMessages((prev) => [
                ...prev,
                {
                    sender: "system",
                    content: "Failed to send message. Please try again.",
                    timestamp: new Date().toISOString(),
                    isError: true,
                },
            ]);
        } finally {
            setIsBotTyping(false);
            setIsLoadingInput(false);
        }
    };

    const chatDisplayTitle = `Chat ${chatId && chatId !== "undefined" && chatId !== "new" ? chatId.slice(-5) : "New"}`;

    return (
        <div className="flex h-screen bg-[#F3F4F6] text-gray-800">
            <Sidebar
                isOpen={isSidebarOpen}
                chatRooms={chatRooms}
                activeRoomId={chatId}
                onSelectRoom={(roomId) => navigate(roomId && roomId !== "undefined" ? `/chat/${roomId}` : "/")}
                onRefresh={() => refreshConversationList()}
            />

            <div className="flex-1 flex flex-col bg-white">
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="mr-4 p-2 rounded-md hover:bg-gray-100"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6 text-gray-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                                />
                            </svg>
                        </button>
                        <h2 className="text-lg font-semibold">{chatDisplayTitle}</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="search"
                            placeholder="Search in chat..."
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 hidden md:block"
                        />
                        <button
                            onClick={() => refreshConversationList()}
                            className="p-2 rounded-md hover:bg-gray-100"
                            title="Refresh chats"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5 text-gray-600"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992M2.985 19.644v-4.992m4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <ChatWindow 
                    messages={messages} 
                    isBotTyping={isBotTyping} 
                    hasLoaded={hasLoaded}
                />
                <ChatInput onSend={handleSend} isLoading={isLoadingInput} />
            </div>
        </div>
    );
}