import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ChatWindow, ChatInput, Sidebar } from "../components";
import {
    createConversation,
    sendMessageToConversation,
    getConversationById,
    getAllConversations,
} from "../controllers/chat";

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [chatId, setChatId] = useState(id || null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoadingInput, setIsLoadingInput] = useState(false);

    // Load chat data
    useEffect(() => {
        const loadChatData = async () => {
            try {
                if (!chatId || chatId === "undefined") {
                    // Create new conversation
                    const res = await createConversation();
                    console.log("Created new conversation:", res);
                    setChatId(res.id);
                    navigate(`/chat/${res.id}`);
                } else {
                    // Load existing conversation
                    console.log("Loading conversation with ID:", chatId);
                    const res = await getConversationById(chatId);
                    console.log("Loaded conversation:", res);
                    if (res && res.messages) {
                        setMessages(res.messages);
                    }
                }

                // Load all conversations for sidebar
                const allConversations = await getAllConversations();
                console.log("All conversations:", allConversations);

                const list = allConversations.map((chat) => ({
                    id: chat.id,
                    name: `Chat ${chat.id ? chat.id.slice(-5) : "New"}`,
                    lastMessageSnippet:
                        chat.messages && chat.messages.length > 0
                            ? chat.messages[
                                  chat.messages.length - 1
                              ]?.content?.slice(0, 30) + "..."
                            : "No messages yet",
                }));
                setChatRooms(list);
            } catch (error) {
                console.error("Error loading chat data:", error);
            }
        };

        loadChatData();
    }, [chatId, navigate]);

    useEffect(() => {
        const userCookie = Cookies.get("user");

        if (!userCookie) {
            alert("Please log in to access the chat.");
            navigate("/login");
        }
    }, []);

    const handleSend = async (text) => {
        setIsLoadingInput(true);

        // Generate temporary ID for optimistic update
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(), // Temporary ID for tracking
        };

        try {
            let currentChatId = chatId;

            // Create new conversation if none exists
            if (!currentChatId || currentChatId === "undefined") {
                console.log("Creating new conversation for message");
                const newChat = await createConversation("anonymous");
                currentChatId = newChat.id;
                setChatId(newChat.id);
                navigate(`/chat/${newChat.id}`);
            }

            // 1. Immediately add user message to UI (optimistic update)
            setMessages((prevMessages) => [...prevMessages, tempUserMessage]);
            setIsBotTyping(true);
            setIsLoadingInput(false); // User can send another message

            // 2. Send message to backend and wait for bot response
            console.log("Sending message to conversation:", currentChatId);
            await sendMessageToConversation(currentChatId, "user", text);

            // 3. Replace optimistic message with real data from backend
            const updated = await getConversationById(currentChatId);

            if (updated && updated.messages) {
                setMessages(updated.messages);
            }
        } catch (err) {
            console.error("Error sending message:", err);

            // Remove the optimistic message on error
            setMessages((prevMessages) =>
                prevMessages.filter(
                    (msg) => msg.tempId !== tempUserMessage.tempId
                )
            );

            // Show error message
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    sender: "system",
                    content: "Failed to send message. Please try again.",
                    timestamp: new Date().toISOString(),
                    isError: true,
                },
            ]);
        } finally {
            setIsBotTyping(false);
        }
    };

    const chatDisplayTitle = `Chat ${
        chatId && chatId !== "undefined"
            ? chatId.substring(chatId.length - 5)
            : "New"
    }`;

    return (
        <div className="flex h-screen bg-[#F3F4F6] text-gray-800">
            <Sidebar
                isOpen={isSidebarOpen}
                chatRooms={chatRooms}
                activeRoomId={chatId}
                onSelectRoom={(roomId) => {
                    if (roomId && roomId !== "undefined") {
                        setChatId(roomId);
                        navigate(`/chat/${roomId}`);
                    }
                }}
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
                        <h2 className="text-lg font-semibold">
                            {chatDisplayTitle}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="search"
                            placeholder="Search in chat..."
                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 hidden md:block"
                        />
                    </div>
                </div>

                <ChatWindow messages={messages} isBotTyping={isBotTyping} />
                <ChatInput onSend={handleSend} isLoading={isLoadingInput} />
            </div>
        </div>
    );
}
