import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ChatWindow, ChatInput, Sidebar } from "../components";
import {
    createConversation,
    getConversationById,
    getAllConversations,
    streamFromBackend,
} from "../controllers/chat";

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const skipNextLoadRef = useRef(null);

    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [chatId, setChatId] = useState(id || null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoadingInput, setIsLoadingInput] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Validation function to check message order integrity
    const validateMessageOrder = (messages) => {
        const issues = [];

        messages.forEach((msg, index) => {
            const expectedSender = index % 2 === 0 ? "user" : "bot";
            if (msg.sender !== expectedSender) {
                issues.push({
                    index,
                    expected: expectedSender,
                    actual: msg.sender,
                    content: msg.content?.slice(0, 50) + "...",
                });
            }
        });

        if (issues.length > 0) {
            console.warn("Message order issues found:", issues);
        }

        return issues.length === 0;
    };

    // Cookie authentication check and set userId
    useEffect(() => {
        const userCookie = Cookies.get("user");
        if (!userCookie) {
            alert("Please log in to access the chat.");
            navigate("/login");
            return;
        }
        try {
            const userData = JSON.parse(userCookie);
            setUserId(userData.id);
            setUser(userData); // Store the full user object
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
                        console.log("Loaded chat:", res.messages[0]);

                        // Enhanced message normalization with index-based validation
                        const normalizedMessages = res.messages.map(
                            (msg, index) => {
                                let sender = msg.sender?.toLowerCase?.().trim();

                                // Normalize assistant to bot
                                if (sender === "assistant") sender = "bot";

                                // Safety check: ensure proper alternating pattern
                                // Assuming conversation starts with user message (index 0)
                                if (index % 2 === 0) {
                                    // Even index should be user
                                    if (sender !== "user") {
                                        console.warn(
                                            `Message at index ${index} corrected: ${sender} -> user`
                                        );
                                        sender = "user";
                                    }
                                } else {
                                    // Odd index should be bot
                                    if (sender !== "bot") {
                                        console.warn(
                                            `Message at index ${index} corrected: ${sender} -> bot`
                                        );
                                        sender = "bot";
                                    }
                                }

                                return { ...msg, sender };
                            }
                        );

                        // Validate the final message order
                        validateMessageOrder(normalizedMessages);

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
                name:
                    chat.name || `Chat ${chat.id ? chat.id.slice(-5) : "New"}`, // Use actual name if available
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

    // Handle rename conversation
    const handleRenameRoom = async (roomId, newName) => {
        try {
            // Call your API to update the conversation name
            // await updateConversationName(roomId, newName);

            // Update local state
            setChatRooms((prev) =>
                prev.map((room) =>
                    room.id === roomId ? { ...room, name: newName } : room
                )
            );

            console.log(`Renamed room ${roomId} to ${newName}`);
        } catch (error) {
            console.error("Error renaming conversation:", error);
        }
    };

    // Handle delete conversation
    const handleDeleteRoom = async (roomId) => {
        try {
            // Call your API to delete the conversation
            // await deleteConversation(roomId);

            // Update local state
            setChatRooms((prev) => prev.filter((room) => room.id !== roomId));

            // If we're currently viewing the deleted chat, navigate to home
            if (chatId === roomId) {
                navigate("/", { replace: true });
            }

            console.log(`Deleted room ${roomId}`);
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };

    // Enhanced handleSend function with file and voice support
    const handleSend = async (text, files = []) => {
        setIsLoadingInput(true);
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(),
            status: "pending",
            files: files, // Include files if any
        };

        try {
            let currentChatId = chatId;
            if (
                !currentChatId ||
                currentChatId === "undefined" ||
                currentChatId === "new"
            ) {
                const newChat = await createConversation(userId);
                currentChatId = newChat.id;
                setChatId(newChat.id);
                skipNextLoadRef.current = newChat.id;
                navigate(`/chat/${newChat.id}`, { replace: true });
            }

            setMessages((prev) => [...prev, tempUserMessage]);
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let botMessageId = null;
            let isFirstChunk = true;

            // Pass files to backend if needed
            await streamFromBackend(
                currentChatId,
                text,
                userId,
                (chunk) => {
                    if (isFirstChunk) {
                        setIsBotTyping(false);
                        isFirstChunk = false;
                    }
                    setMessages((prev) => {
                        const updated = [...prev];
                        const botIndex = updated.findIndex(
                            (msg) => msg.tempId === botMessageId
                        );
                        if (botIndex !== -1) {
                            updated[botIndex] = {
                                ...updated[botIndex],
                                content: updated[botIndex].content + chunk,
                            };
                        } else {
                            botMessageId = Date.now();
                            updated.push({
                                sender: "bot",
                                content: chunk,
                                timestamp: new Date().toISOString(),
                                tempId: botMessageId,
                            });
                        }
                        return updated;
                    });
                },
                files
            ); // Pass files to streaming function

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === tempUserMessage.tempId
                        ? { ...msg, status: "delivered" }
                        : msg
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

    // Handle file upload
    const handleFileUpload = (files) => {
        console.log("Files uploaded:", files);
        // You can process files here if needed
    };

    // Handle voice recording
    const handleVoiceRecord = (audioBlob) => {
        console.log("Voice recorded:", audioBlob);
        // You can process the audio blob here
        // For example, convert to text or send to backend
    };

    // Format chat name using the same logic as the sidebar
    const formatChatName = (room) => {
        if (room.name && room.name !== `Chat ${room.id?.slice(-5)}`) {
            return room.name;
        }
        return room.lastMessageSnippet &&
            room.lastMessageSnippet !== "No messages yet"
            ? room.lastMessageSnippet.slice(0, 30) + "..."
            : `Chat ${room.id?.slice(-5) || "New"}`;
    };

    // Get the actual chat title from chatRooms data using the same formatting as sidebar
    const getCurrentChatTitle = () => {
        if (!chatId || chatId === "undefined" || chatId === "new") {
            return "New Chat";
        }

        // Find the current chat in chatRooms to get its actual name
        const currentChat = chatRooms.find((room) => room.id === chatId);
        if (currentChat) {
            return formatChatName(currentChat);
        }

        // Fallback to generic name if not found
        return `Chat ${chatId.slice(-5)}`;
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar
                isOpen={isSidebarOpen}
                chatRooms={chatRooms}
                activeRoomId={chatId}
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

            <div className="flex-1 flex flex-col min-w-0">
                {/* Simplified Header - removed toggle button since it's now in sidebar */}
                <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                                {getCurrentChatTitle()}
                            </span>
                        </div>
                    </div>
                </div>

                <ChatWindow
                    messages={messages}
                    isBotTyping={isBotTyping}
                    hasLoaded={hasLoaded}
                />
                <ChatInput
                    onSend={handleSend}
                    onFileUpload={handleFileUpload}
                    onVoiceRecord={handleVoiceRecord}
                    isLoading={isLoadingInput}
                />
            </div>
        </div>
    );
}
