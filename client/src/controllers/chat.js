import axios from "axios";
import { app } from "../config/keys";

export const createConversation = async (user_id, message) => {
    try {
        const requestBody = {
            content: message,
            image: "", // Add actual base64 if needed
            timestamp: new Date().toISOString(),
        };

        const res = await axios.post(
            `${app.serverURL}/api/conversations/create/${user_id}`,
            requestBody, // send the Message body directly
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return res.data;
    } catch (error) {
        console.error("Failed to create conversation", error);
        throw error;
    }
};

export const getAllConversations = async (userId) => {
    try {
        const res = await axios.get(
            `${app.serverURL}/api/conversations/user/${userId}`
        );
        return res.data;
    } catch (error) {
        console.error("Failed to load conversations", error);
        return [];
    }
};

export const getConversationById = async (conversationId) => {
    if (!conversationId || conversationId === "undefined") {
        console.error(
            "Invalid conversationId for getConversationById:",
            conversationId
        );
        return null;
    }

    try {
        const res = await axios.get(
            `${app.serverURL}/api/conversations/chat/${conversationId}`
        );
        return res.data;
    } catch (error) {
        console.error("Failed to get conversation", error);
        return null;
    }
};

// Best hybrid version - combines performance with reliability using fetch
export async function streamFromBackend(
    conversationId,
    userId,
    content,
    onChunk
) {
    if (!conversationId || conversationId === "undefined") {
        throw new Error("Conversation ID is required");
    }

    const requestBody = {
        content,
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(
            `${app.serverURL}/api/conversations/${conversationId}/${userId}/stream`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok || !response.body) {
            throw new Error("No streamable response from backend");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                let eventEndIndex;
                while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
                    const event = buffer.slice(0, eventEndIndex);
                    buffer = buffer.slice(eventEndIndex + 2);
                    processSSEEvent(event, onChunk);
                }

                // Fallback for servers that don’t send \n\n
                if (!buffer.includes("\n\n") && buffer.includes("\n")) {
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.trim().startsWith("data: ")) {
                            const data = line.trim().slice(6);
                            if (data === "[DONE]") return;
                            onChunk?.(data);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    } catch (error) {
        console.error("Streaming error:", error);
        throw error;
    }
}

// Helper method for processing complete SSE events
function processSSEEvent(event, onChunk) {
    for (const line of event.split("\n")) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            if (data === "[DONE]") return true; // Signal completion
            onChunk?.(data);
        }
    }
    return false;
}

export const renameConversation = async (conversationId, newTitle) => {
    try {
        const response = await axios.put(
            `${app.serverURL}/api/conversations/${conversationId}/rename`,
            { title: newTitle },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Conversation renamed successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error renaming conversation:", error);
        throw error;
    }
};

// Delete conversation
export const deleteConversation = async (conversationId, userId) => {
    try {
        const response = await axios.delete(
            `${app.serverURL}/api/conversations/${conversationId}/user/${userId}`
        );

        console.log("Conversation deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
};
