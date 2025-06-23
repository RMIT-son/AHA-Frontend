import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

    // Tạo mới hoặc load lại chat
    useEffect(() => {
        if (!chatId) {
            createConversation().then((res) => {
                setChatId(res._id);
                navigate(`/chat/${res._id}`);
            });
        } else {
            getConversationById(chatId).then((res) => {
                if (res) setMessages(res.messages || []);
            });

            getAllConversations().then((res) => {
                const list = res.map((chat) => ({
                    id: chat._id,
                    name: `Chat ${chat._id.slice(-5)}`,
                    lastMessageSnippet:
                        chat.messages?.[
                            chat.messages.length - 1
                        ]?.content.slice(0, 30) + "...",
                }));
                setChatRooms(list);
            });
        }
    }, [chatId]);

    const handleSend = async (text) => {
        setIsLoadingInput(true);
        setIsBotTyping(true);

        try {
            let currentChatId = chatId;

            if (!currentChatId) {
                const newChat = await createConversation("anonymous");
                currentChatId = newChat._id;
                setChatId(newChat._id);
                navigate(`/chat/${newChat._id}`);
            }

            await sendMessageToConversation(currentChatId, "user", text);

            const updated = await getConversationById(currentChatId);
            setMessages(updated.messages || []);
        } catch (err) {
            console.error("Error sending message:", err);
        } finally {
            setIsLoadingInput(false);
            setIsBotTyping(false);
        }
    };

    const chatDisplayTitle = `Chat ${
        chatId?.substring(chatId.length - 5) || ""
    }`;

    return (
        <div className="flex h-screen bg-[#F3F4F6] text-gray-800">
            <Sidebar
                isOpen={isSidebarOpen}
                chatRooms={chatRooms}
                activeRoomId={chatId}
                onSelectRoom={(roomId) => {
                    setChatId(roomId);
                    navigate(`/chat/${roomId}`);
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
