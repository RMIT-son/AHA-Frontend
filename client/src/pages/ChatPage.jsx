import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ChatWindow, ChatInput, Sidebar } from "../components";
import {
    createConversation,
    getConversationById,
    getAllConversations,
    streamFromBackend,
    renameConversation,
    deleteConversation,
} from "../controllers/chat";

export default function ChatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const skipNextLoadRef = useRef(null);
    const streamingTimeoutRef = useRef(null);
    const currentStreamingMessageRef = useRef(null);
    const streamingBufferRef = useRef(""); // Buffer for batching

    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [chatId, setChatId] = useState(id || null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoadingInput, setIsLoadingInput] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [shouldReloadAfterStream, setShouldReloadAfterStream] = useState(false);

    // Validation function to check message order integrity
    const validateMessageOrder = useCallback((messages) => {
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
    }, []);

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

    // Memoized conversation list refresh
    const refreshConversationList = useCallback(async (uid = userId) => {
        if (!uid) return;
        try {
            const allConversations = await getAllConversations(uid);
            const list = allConversations.map((chat) => ({
                id: chat.id,
                name: chat.title || `Chat ${chat.id ? chat.id.slice(-5) : "New"}`,
                title: chat.title,
                lastMessageSnippet:
                    chat.messages && chat.messages.length > 0
                        ? chat.messages[chat.messages.length - 1]?.content?.slice(0, 30) + "..."
                        : "No messages yet",
            }));
            setChatRooms(list);
        } catch (error) {
            console.error("Error refreshing conversation list:", error);
        }
    }, [userId]);

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
                        const normalizedMessages = res.messages.map((msg, index) => {
                            let sender = msg.sender?.toLowerCase?.().trim();
                            if (sender === "assistant") sender = "bot";
                            if (index % 2 === 0) {
                                if (sender !== "user") sender = "user";
                            } else {
                                if (sender !== "bot") sender = "bot";
                            }
                            return { ...msg, sender };
                        });
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
    }, [id, userId, refreshConversationList, validateMessageOrder]);

    // Optimized streaming message updater with batching
    const updateStreamingMessage = useCallback((chunk) => {
        streamingBufferRef.current += chunk;
        
        // Use requestAnimationFrame for smooth updates
        if (currentStreamingMessageRef.current) {
            cancelAnimationFrame(currentStreamingMessageRef.current);
        }
        
        currentStreamingMessageRef.current = requestAnimationFrame(() => {
            const bufferedContent = streamingBufferRef.current;
            
            setMessages((prev) => {
                const updated = [...prev];
                const lastMessage = updated[updated.length - 1];
                
                if (lastMessage && lastMessage.sender === "bot" && lastMessage.tempId) {
                    // Update existing message - create new object
                    updated[updated.length - 1] = {
                        ...lastMessage,
                        content: bufferedContent,
                    };
                } else {
                    // Create new bot message
                    const botMessageId = Date.now();
                    updated.push({
                        sender: "bot",
                        content: bufferedContent,
                        timestamp: new Date().toISOString(),
                        tempId: botMessageId,
                    });
                }
                return updated;
            });
        });
    }, []);

    // Memoized rename handler
    const handleRenameRoom = useCallback(async (roomId, newName) => {
        try {
            const updatedConversation = await renameConversation(roomId, newName);
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
    }, []);

    // Memoized delete handler
    const handleDeleteRoom = useCallback(async (roomId) => {
        try {
            await deleteConversation(roomId, userId);
            setChatRooms((prev) => prev.filter((room) => room.id !== roomId));
            if (chatId === roomId) {
                navigate("/", { replace: true });
            }
            console.log(`Deleted room ${roomId}`);
        } catch (error) {
            console.error("Error deleting conversation:", error);
            alert("Failed to delete conversation. Please try again.");
            throw error;
        }
    }, [userId, chatId, navigate]);

    // Optimized handleSend function with batching and throttling
    const handleSend = useCallback(async (text, files = []) => {
        setIsLoadingInput(true);
        setShouldReloadAfterStream(false);
        streamingBufferRef.current = ""; // Reset buffer

        // Process files
        const processedFiles = files.map(file => {
            if (file.type && file.type.startsWith('image/')) {
                return {
                    ...file,
                    url: file.url || file.src || file.preview
                };
            }
            return file;
        });

        // Create temp user message
        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(),
            status: "pending",
            files: processedFiles,
            image: processedFiles.find(f => f.type && f.type.startsWith('image/'))?.url || null
        };

        try {
            let currentChatId = chatId;
            
            // Handle new conversation creation
            if (!currentChatId || currentChatId === "undefined" || currentChatId === "new") {
                const newChat = await createConversation(userId, text, processedFiles);
                currentChatId = newChat.id;
                setChatId(newChat.id);
                skipNextLoadRef.current = newChat.id;

                setChatRooms((prev) => [
                    {
                        id: newChat.id,
                        name: newChat.title,
                        lastMessageSnippet: text.slice(0, 30) + "...",
                    },
                    ...prev,
                ]);

                navigate(`/chat/${newChat.id}`, { replace: true });
            }

            // Add user message and show typing
            setMessages((prev) => [...prev, tempUserMessage]);
            setIsBotTyping(true);
            setIsStreaming(false);
            setIsLoadingInput(false);

            let isFirstChunk = true;

            // Stream from backend with optimized chunk handling
            await streamFromBackend(
                currentChatId,
                userId,
                text,
                (chunk) => {
                    if (isFirstChunk) {
                        setIsBotTyping(false);
                        setIsStreaming(true);
                        isFirstChunk = false;
                    }

                    // Use optimized batch updater
                    updateStreamingMessage(chunk);

                    // Reset timeout for reload after stream
                    if (streamingTimeoutRef.current) {
                        clearTimeout(streamingTimeoutRef.current);
                    }
                    streamingTimeoutRef.current = setTimeout(() => {
                        setShouldReloadAfterStream(true);
                    }, 1000); // Reduced timeout for faster response
                },
                processedFiles
            );

            // Cleanup streaming state
            setIsStreaming(false);
            if (currentStreamingMessageRef.current) {
                cancelAnimationFrame(currentStreamingMessageRef.current);
                currentStreamingMessageRef.current = null;
            }

            // Update message status
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.tempId === tempUserMessage.tempId
                        ? { ...msg, status: "delivered" }
                        : msg
                )
            );

            // Refresh conversation list
            await refreshConversationList();

        } catch (err) {
            console.error("Error sending message:", err);
            setShouldReloadAfterStream(false);
            setIsStreaming(false);

            // Handle error state
            setMessages((prev) => [
                ...prev.map((msg) =>
                    msg.tempId === tempUserMessage.tempId
                        ? { ...msg, status: "failed", error: err.message }
                        : msg
                ),
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
            setIsStreaming(false);
            streamingBufferRef.current = "";
        }
    }, [chatId, userId, navigate, updateStreamingMessage, refreshConversationList]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
            }
            if (currentStreamingMessageRef.current) {
                cancelAnimationFrame(currentStreamingMessageRef.current);
            }
        };
    }, []);

    // Memoized file upload handler
    const handleFileUpload = useCallback((files) => {
        console.log("Files uploaded:", files);
        return files;
    }, []);

    // Memoized voice record handler
    const handleVoiceRecord = useCallback((audioBlob) => {
        console.log("Voice recorded:", audioBlob);
    }, []);

    // Memoized formatChatName function
    const formatChatName = useCallback((room) => {
        if (room.title && room.title.trim() !== "") {
            return room.title;
        }
        if (room.name && room.name !== `Chat ${room.id?.slice(-5)}`) {
            return room.name;
        }
        return room.lastMessageSnippet && room.lastMessageSnippet !== "No messages yet"
            ? room.lastMessageSnippet.slice(0, 30) + "..."
            : `Chat ${room.id?.slice(-5) || "New"}`;
    }, []);

    // Memoized current chat title
    const currentChatTitle = useMemo(() => {
        if (!chatId || chatId === "undefined" || chatId === "new") {
            return "New Chat";
        }
        const currentChat = chatRooms.find((room) => room.id === chatId);
        return currentChat ? formatChatName(currentChat) : `Chat ${chatId.slice(-5)}`;
    }, [chatId, chatRooms, formatChatName]);

    return (
        <div className="flex h-screen bg-white">
            <Sidebar
                isOpen={isSidebarOpen}
                chatRooms={chatRooms}
                activeRoomId={chatId}
                onSelectRoom={(roomId) =>
                    navigate(roomId && roomId !== "undefined" ? `/chat/${roomId}` : "/")
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
                                {currentChatTitle}
                            </span>
                        </div>
                    </div>
                </div>

                <ChatWindow
                    messages={messages}
                    isBotTyping={isBotTyping}
                    hasLoaded={hasLoaded}
                    user={user}
                    isStreaming={isStreaming}
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