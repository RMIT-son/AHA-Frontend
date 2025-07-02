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

    // New state to track when streaming ends
    const [shouldReloadAfterStream, setShouldReloadAfterStream] = useState(false);
    const streamingTimeoutRef = useRef(null);

    // Effect to handle page reload after streaming
    useEffect(() => {
        if (shouldReloadAfterStream && !isBotTyping) {
            // Small delay to ensure everything is settled
            const reloadTimeout = setTimeout(() => {
                window.location.reload();
            }, 500);
            
            return () => clearTimeout(reloadTimeout);
        }
    }, [shouldReloadAfterStream, isBotTyping]);

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
            setUser(userData);
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

                        const normalizedMessages = res.messages.map(
                            (msg, index) => {
                                let sender = msg.sender?.toLowerCase?.().trim();

                                if (sender === "assistant") sender = "bot";

                                if (index % 2 === 0) {
                                    if (sender !== "user") {
                                        console.warn(
                                            `Message at index ${index} corrected: ${sender} -> user`
                                        );
                                        sender = "user";
                                    }
                                } else {
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
                    chat.name || `Chat ${chat.id ? chat.id.slice(-5) : "New"}`,
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

    const handleRenameRoom = async (roomId, newName) => {
        try {
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

    const handleDeleteRoom = async (roomId) => {
        try {
            setChatRooms((prev) => prev.filter((room) => room.id !== roomId));
            if (chatId === roomId) {
                navigate("/", { replace: true });
            }
            console.log(`Deleted room ${roomId}`);
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };

    // Enhanced handleSend function with auto-reload after streaming
    const handleSend = async (text, files = []) => {
        setIsLoadingInput(true);
        setShouldReloadAfterStream(false); // Reset reload flag
        
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(),
            status: "pending",
            files: files,
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

            await streamFromBackend(
                currentChatId,
                text,
                userId,
                (chunk) => {
                    if (isFirstChunk) {
                        setIsBotTyping(false);
                        isFirstChunk = false;
                    }
                    
                    // Clear any existing timeout
                    if (streamingTimeoutRef.current) {
                        clearTimeout(streamingTimeoutRef.current);
                    }
                    
                    // Set a new timeout to detect when streaming stops
                    streamingTimeoutRef.current = setTimeout(() => {
                        // If no new chunks come in 2 seconds, consider streaming finished
                        setShouldReloadAfterStream(true);
                    }, 2000);
                    
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
            );

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
            setShouldReloadAfterStream(false); // Don't reload on error
            
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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
            }
        };
    }, []);

    const handleFileUpload = (files) => {
        console.log("Files uploaded:", files);
    };

    const handleVoiceRecord = (audioBlob) => {
        console.log("Voice recorded:", audioBlob);
    };

    const formatChatName = (room) => {
        if (room.name && room.name !== `Chat ${room.id?.slice(-5)}`) {
            return room.name;
        }
        return room.lastMessageSnippet &&
            room.lastMessageSnippet !== "No messages yet"
            ? room.lastMessageSnippet.slice(0, 30) + "..."
            : `Chat ${room.id?.slice(-5) || "New"}`;
    };

    const getCurrentChatTitle = () => {
        if (!chatId || chatId === "undefined" || chatId === "new") {
            return "New Chat";
        }

        const currentChat = chatRooms.find((room) => room.id === chatId);
        if (currentChat) {
            return formatChatName(currentChat);
        }

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