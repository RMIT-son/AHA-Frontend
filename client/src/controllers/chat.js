import axios from "axios";
import { app } from "../config/keys";

export const createConversation = async (user_id = "anonymous") => {
    try {
        console.log("Creating conversation for user:", user_id);
        const res = await axios.post(`${app.serverURL}/api/conversations/`, {
            user_id,
        });
        console.log("Created conversation:", res.data);
        return res.data;
    } catch (error) {
        console.error("Failed to create conversation", error);
        throw error;
    }
};

// Send a message to a specific conversation
export const sendMessageToConversation = async (
    conversationId,
    sender,
    content
) => {
    // Add validation and debugging
    if (!conversationId || conversationId === "undefined") {
        console.error("Invalid conversationId:", conversationId);
        throw new Error("Conversation ID is required and cannot be undefined");
    }

    console.log("Sending message:", { conversationId, sender, content });

    try {
        const res = await axios.post(
            `${app.serverURL}/api/conversations/${conversationId}/message`,
            {
                sender,
                content,
            }
        );
        console.log("Message sent successfully:", res.data);
        return res.data; // Updated conversation
    } catch (error) {
        console.error("Failed to send message", error);
        console.error("Error details:", error.response?.data);
        throw error;
    }
};

export const getAllConversations = async () => {
    try {
        const res = await axios.get(`${app.serverURL}/api/conversations/`);
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
            `${app.serverURL}/api/conversations/${conversationId}`
        );
        return res.data;
    } catch (error) {
        console.error("Failed to get conversation", error);
        return null;
    }
};
