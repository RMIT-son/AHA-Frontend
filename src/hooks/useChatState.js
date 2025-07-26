import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
    createConversation,
    getConversationById,
    getAllConversations,
    streamFromBackend,
    sendVoiceMessage,
} from "../controllers/chat";

export default function useChatState() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Refs
    const skipNextLoadRef = useRef(null);
    const activeStreamRef = useRef(null);
    const currentChatIdRef = useRef(null);
    const streamingTimeoutRef = useRef(null);

    // State
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
    const [canSendNewMessage, setCanSendNewMessage] = useState(true);
    const [isProcessingMessage, setIsProcessingMessage] = useState(false);
    const [transcribedText, setTranscribedText] = useState("");
    const [isTranscribing, setIsTranscribing] = useState(false);

    // Update currentChatIdRef whenever chatId changes
    useEffect(() => {
        currentChatIdRef.current = chatId;
    }, [chatId]);

    // Helper functions
    const createTempImageUrls = (files) => {
        return files.map((file) => {
            if (file.file && file.file instanceof File) {
                const tempUrl = URL.createObjectURL(file.file);
                return {
                    url: tempUrl,
                    name: file.name || file.file.name,
                    type: file.type || file.file.type,
                    isTemporary: true,
                };
            } else if (file.preview) {
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

    const refreshConversationList = async (uid = userId) => {
        if (!uid) return;
        try {
            const allConversations = await getAllConversations(uid);
            const list = allConversations.map((chat) => ({
                id: chat.id,
                name: chat.title || "New Chat",
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

    const formatChatName = (room) => {
        if (room.title && room.title.trim() !== "") {
            return room.title;
        }
        if (
            room.name &&
            room.name.trim() !== "" &&
            !room.name.startsWith("Chat ")
        ) {
            return room.name;
        }
        return "New Chat";
    };

    const getCurrentChatTitle = () => {
        if (!chatId || chatId === "undefined" || chatId === "new") {
            return "New Chat";
        }
        const currentChat = chatRooms.find((room) => room.id === chatId);
        if (currentChat) {
            return formatChatName(currentChat);
        }
        return "New Chat";
    };

    return {
        // State
        userId,
        setUserId,
        user,
        setUser,
        chatId,
        setChatId,
        messages,
        setMessages,
        chatRooms,
        setChatRooms,
        isBotTyping,
        setIsBotTyping,
        isLoadingInput,
        setIsLoadingInput,
        hasLoaded,
        setHasLoaded,
        isStreaming,
        setIsStreaming,
        shouldReloadAfterStream,
        setShouldReloadAfterStream,
        canSendNewMessage,
        setCanSendNewMessage,
        isProcessingMessage,
        setIsProcessingMessage,
        transcribedText,
        setTranscribedText,
        isTranscribing,
        setIsTranscribing,

        // Refs
        skipNextLoadRef,
        activeStreamRef,
        currentChatIdRef,
        streamingTimeoutRef,

        // Functions
        createTempImageUrls,
        validateMessageOrder,
        refreshConversationList,
        getCurrentChatTitle,

        // Navigation
        navigate,
        id,
    };
}
