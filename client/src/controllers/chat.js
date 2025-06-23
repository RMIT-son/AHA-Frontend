import axios from "axios";
import { app } from "../config/keys";

export const createConversation = async (user_id = "anonymous") => {
    try {
        const res = await axios.post(`${app.serverURL}/api/conversations`, {
            user_id,
        });
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
    try {
        const res = await axios.post(
            `${app.serverURL}/api/conversations/${conversationId}/message`,
            {
                sender,
                content,
            }
        );
        return res.data; // Updated conversation
    } catch (error) {
        console.error("Failed to send message", error);
        throw error;
    }
};

export const getAllConversations = async () => {
    try {
        const res = await axios.get(`${app.serverURL}/api/conversations`);
        return res.data;
    } catch (error) {
        console.error("Failed to load conversations", error);
        return [];
    }
};

export const getConversationById = async (conversationId) => {
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
