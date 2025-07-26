import { useEffect } from "react";
import { getConversationById } from "../controllers/chat";

export default function useChatData({
    id,
    userId,
    skipNextLoadRef,
    setChatId,
    setMessages,
    validateMessageOrder,
    refreshConversationList,
    setHasLoaded,
}) {
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
}
