import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { ChatWindow, ChatInput } from "../components";
import ChatLayout from "../components/ChatLayout";
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
    const activeStreamRef = useRef(null); // Track active streaming request
    const currentChatIdRef = useRef(null); // Track current chat ID

    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [chatId, setChatId] = useState(id || null);
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isLoadingInput, setIsLoadingInput] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [shouldReloadAfterStream, setShouldReloadAfterStream] =
        useState(false);
    const streamingTimeoutRef = useRef(null);

    // Update currentChatIdRef whenever chatId changes
    useEffect(() => {
        currentChatIdRef.current = chatId;
    }, [chatId]);

    // Cleanup active streams when component unmounts or chat changes
    useEffect(() => {
        return () => {
            // Cancel any active streaming when component unmounts
            if (activeStreamRef.current) {
                activeStreamRef.current.cancelled = true;
            }
            if (streamingTimeoutRef.current) {
                clearTimeout(streamingTimeoutRef.current);
            }
        };
    }, []);

    // Cancel streaming when navigating to different chat
    useEffect(() => {
        if (
            activeStreamRef.current &&
            activeStreamRef.current.chatId !== chatId
        ) {
            activeStreamRef.current.cancelled = true;
            setIsStreaming(false);
            setIsBotTyping(false);
        }
    }, [chatId]);

    // Helper function to create temporary image URLs from File objects
    const createTempImageUrls = (files) => {
        return files.map((file) => {
            if (file.file && file.file instanceof File) {
                // Create a temporary URL for the file
                const tempUrl = URL.createObjectURL(file.file);
                return {
                    url: tempUrl,
                    name: file.name || file.file.name,
                    type: file.type || file.file.type,
                    isTemporary: true, // Flag to identify temporary URLs
                };
            } else if (file.preview) {
                // Use existing preview (base64 data URL)
                return {
                    url: file.preview,
                    name: file.name,
                    type: file.type,
                    isTemporary: true,
                };
            }
            return file;
        });
    };

    // Cleanup temporary URLs when component unmounts
    useEffect(() => {
        return () => {
            // Clean up any temporary URLs when component unmounts
            messages.forEach((message) => {
                if (message.files) {
                    message.files.forEach((file) => {
                        if (
                            file.isTemporary &&
                            file.url &&
                            file.url.startsWith("blob:")
                        ) {
                            URL.revokeObjectURL(file.url);
                        }
                    });
                }
            });
        };
    }, []);

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

    const handleSend = async (text, files = []) => {
        setIsLoadingInput(true);
        setShouldReloadAfterStream(false);

        // Create temporary image URLs for immediate display
        const tempImageUrls = createTempImageUrls(files);

        const tempUserMessage = {
            sender: "user",
            content: text,
            timestamp: new Date().toISOString(),
            tempId: Date.now(),
            status: "pending",
            files: tempImageUrls, // Use temporary URLs for immediate display
        };

        try {
            let currentChatId = chatId;

            if (
                !currentChatId ||
                currentChatId === "undefined" ||
                currentChatId === "new"
            ) {
                const newChat = await createConversation(userId, text, files);
                currentChatId = newChat.id;
                setChatId(newChat.id);
                skipNextLoadRef.current = newChat.id;
                navigate(`/chat/${newChat.id}`, { replace: true });
            }

            // Create a stream tracking object
            const streamTracker = {
                chatId: currentChatId,
                cancelled: false,
            };
            activeStreamRef.current = streamTracker;

            setMessages((prev) => [...prev, tempUserMessage]);
            setIsBotTyping(true);
            setIsLoadingInput(false);

            let botMessageId = null;
            let isFirstChunk = true;
            setIsStreaming(true);

            await streamFromBackend(
                currentChatId,
                userId,
                text,
                (chunk) => {
                    // Check if this stream has been cancelled or if we're in a different chat
                    if (
                        streamTracker.cancelled ||
                        currentChatIdRef.current !== currentChatId
                    ) {
                        console.log(
                            "Stream cancelled or chat changed, ignoring chunk"
                        );
                        return;
                    }

                    if (isFirstChunk) {
                        setIsBotTyping(false);
                        isFirstChunk = false;
                    }

                    if (streamingTimeoutRef.current) {
                        clearTimeout(streamingTimeoutRef.current);
                    }

                    streamingTimeoutRef.current = setTimeout(() => {
                        setShouldReloadAfterStream(true);
                    }, 2000);

                    setMessages((prev) => {
                        const updated = [...prev];
                        const botIndex = updated.findIndex(
                            (msg) => msg.tempId === botMessageId
                        );
                        if (botIndex !== -1) {
                            const updatedMsg = {
                                ...updated[botIndex],
                                content: updated[botIndex].content + chunk,
                            };
                            updated[botIndex] = updatedMsg;
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

            // Only continue if stream wasn't cancelled
            if (
                !streamTracker.cancelled &&
                currentChatIdRef.current === currentChatId
            ) {
                setIsStreaming(false);

                // Update user message status while preserving files
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.tempId === tempUserMessage.tempId
                            ? { ...msg, status: "delivered" }
                            : msg
                    )
                );

                // Always refresh conversation list after successful send
                await refreshConversationList();
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setShouldReloadAfterStream(false);
            setIsStreaming(false);
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

            // Clean up temporary URLs only on error
            tempImageUrls.forEach((file) => {
                if (
                    file.isTemporary &&
                    file.url &&
                    file.url.startsWith("blob:")
                ) {
                    URL.revokeObjectURL(file.url);
                }
            });
        } finally {
            setIsBotTyping(false);
            setIsLoadingInput(false);
            setIsStreaming(false);
            activeStreamRef.current = null;
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

    const formatChatName = (room) => {
        if (room.title && room.title.trim() !== "") {
            return room.title;
        }
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
        <ChatLayout
            activeRoomId={chatId}
            headerTitle={getCurrentChatTitle()}
            chatRooms={chatRooms}
            user={user}
            onChatRoomsUpdate={refreshConversationList}
        >
            <ChatWindow
                messages={messages}
                isBotTyping={isBotTyping}
                hasLoaded={hasLoaded}
                user={user}
                isStreaming={isStreaming}
            />
            <ChatInput onSend={handleSend} isLoading={isLoadingInput} />
        </ChatLayout>
    );
}
