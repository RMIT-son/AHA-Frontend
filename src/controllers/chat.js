import axios from "axios";
import { app } from "../config/keys";

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

// Helper function to process files for backend
const processFilesForBackend = async (files) => {
    if (!files || files.length === 0) return [];

    const processedFiles = [];

    for (const fileData of files) {
        try {
            let base64Data;

            // If preview already exists (for images), use it
            if (fileData.preview) {
                base64Data = fileData.preview;
            } else {
                // Convert file to base64
                base64Data = await fileToBase64(fileData.file);
            }

            processedFiles.push({
                name: fileData.name,
                type: fileData.type,
                size: fileData.size,
                data: base64Data, // base64 string including data:image/jpeg;base64, prefix
            });
        } catch (error) {
            console.error(`Error processing file ${fileData.name}:`, error);
            // Skip this file but continue with others
        }
    }

    return processedFiles;
};

export const createConversation = async (user_id, message, files = []) => {
    try {
        // Process files to base64
        const processedFiles = await processFilesForBackend(files);

        const requestBody = {
            content: message,
            files: processedFiles, // Send array of file objects
            timestamp: new Date().toISOString(),
        };

        const res = await axios.post(
            `${app.dataURL}/api/conversations/create/${user_id}`,
            requestBody,
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
            `${app.dataURL}/api/conversations/user/${userId}`
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
            `${app.dataURL}/api/conversations/chat/${conversationId}`
        );
        return res.data;
    } catch (error) {
        console.error("Failed to get conversation", error);
        return null;
    }
};

// Enhanced streaming function with file support
export async function streamFromBackend(
    conversationId,
    userId,
    content,
    onChunk,
    files = []
) {
    if (!conversationId || conversationId === "undefined") {
        throw new Error("Conversation ID is required");
    }

    // Process files to base64
    const processedFiles = await processFilesForBackend(files);

    const requestBody = {
        content,
        files: processedFiles, // Include processed files
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(
            `${app.dataURL}/api/conversations/${conversationId}/${userId}/stream`,
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

                // Fallback for servers that don't send \n\n
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
            `${app.dataURL}/api/conversations/${conversationId}/rename`,
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
            `${app.dataURL}/api/conversations/${conversationId}/user/${userId}`
        );

        console.log("Conversation deleted successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
};

const audioBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            // Extract just the base64 part (after the comma)
            const base64Only = dataUrl.split(",")[1];
            resolve(base64Only);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};

export const sendVoiceMessage = async (
    conversationId,
    userId,
    audioBlob,
    onChunk
) => {
    try {
        console.log("Converting audio blob to base64...");

        const base64Audio = await audioBlobToBase64(audioBlob);

        console.log("Base64 audio length:", base64Audio.length);
        console.log("Base64 preview:", base64Audio.substring(0, 50));

        const response = await axios.post(
            `${app.dataURL}/api/conversations/speech_to_text`,
            {
                audio: base64Audio,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Transcription response:", response.data);
        const transcribedText = response.data;

        if (onChunk && transcribedText) {
            onChunk(transcribedText);
        }

        return {
            conversationId: conversationId,
            success: true,
            transcribedText: transcribedText,
        };
    } catch (error) {
        console.error("Error sending voice message:", error);

        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            throw new Error(
                `HTTP ${error.response.status}: ${
                    error.response.data?.detail || error.response.statusText
                }`
            );
        } else if (error.request) {
            throw new Error("Network error: No response received from server");
        } else {
            throw error;
        }
    }
};
