// src/controllers/chat.js
// Modified to use mock responses for testing

import axios from "axios";
import { app } from "../config/keys";

// Import mock responses
import {
    mockCreateConversation,
    mockGetAllConversations,
    mockGetConversationById,
    mockSendMessageToBackend,
    mockRenameConversation,
    mockDeleteConversation,
    mockSendVoiceMessage,
    mockSendWebSearchRequest,
    mockSendTextToVoiceSpeaker,
    mockSearchAllChats,
} from "./mockChatApi";

// Configuration: Set to true to use mock responses, false to use real API
const USE_MOCK_API = false; // Change this to false when your backend is ready

// Helper function to convert base64 to File
const base64ToFile = async (base64String, fileName, mimeType) => {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");

    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return new File([base64String], fileName, { type: mimeType });
};

// Helper function to check if files are audio-only
const isAudioOnlyRequest = (files) => {
    if (!files || files.length === 0) return false;

    // Check if all files are audio files
    return files.every((fileData) => {
        const type = fileData.type || fileData.file?.type || "";
        const name = fileData.name || fileData.file?.name || "";
        const isAudioType = type.startsWith("audio/");
        const hasAudioExtension = /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(name);

        return isAudioType || hasAudioExtension || fileData.isAudio;
    });
};

const processFilesForBackend = async (files) => {
    if (!files || files.length === 0) return [];

    const processedFiles = [];

    for (const fileData of files) {
        try {
            // For multipart/form-data, we need the actual File object
            // If we have a preview (base64), we need to convert it back to a File
            let fileToUpload;

            if (fileData.file instanceof File) {
                // If it's already a File object, use it directly
                fileToUpload = fileData.file;
            } else if (fileData.preview && fileData.type.startsWith("image/")) {
                // Convert base64 back to File for images
                fileToUpload = await base64ToFile(
                    fileData.preview,
                    fileData.name,
                    fileData.type
                );
            } else if (fileData.file) {
                // For other file types, use the file directly
                fileToUpload = fileData.file;
            } else {
                continue;
            }

            processedFiles.push(fileToUpload);
        } catch (error) {
            // Skip files with errors
            console.warn("Error processing file:", error);
        }
    }
    return processedFiles;
};

export const createConversation = async (user_id, content, files = []) => {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for createConversation");
        return await mockCreateConversation(user_id, content, files);
    }

    try {
        // Process files to base64
        const processedFiles = await processFilesForBackend(files);

        // Create FormData for multipart/form-data request
        const formData = new FormData();

        // Add text content and timestamp
        if (content) {
            formData.append("content", content);
        }

        // Add files to FormData
        processedFiles.forEach((file) => {
            formData.append("files", file);
        });

        const res = await axios.post(
            `${app.dataURL}/api/conversations/create/${user_id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const getAllConversations = async (userId) => {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for getAllConversations");
        return await mockGetAllConversations(userId);
    }

    try {
        const res = await axios.get(
            `${app.dataURL}/api/conversations/user/${userId}`
        );
        return res.data;
    } catch (error) {
        return [];
    }
};

export const getConversationById = async (conversationId) => {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for getConversationById");
        return await mockGetConversationById(conversationId);
    }

    if (!conversationId || conversationId === "undefined") {
        return null;
    }

    try {
        const res = await axios.get(
            `${app.dataURL}/api/conversations/chat/${conversationId}`
        );
        return res.data;
    } catch (error) {
        return null;
    }
};

// Modified function to handle complete response with audio endpoint routing
export async function sendMessageToBackend(
    conversationId,
    userId,
    content,
    files = []
) {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for sendMessageToBackend");
        return await mockSendMessageToBackend(
            conversationId,
            userId,
            content,
            files
        );
    }

    if (!conversationId || conversationId === "undefined") {
        throw new Error("Conversation ID is required");
    }

    // Process files for multipart/form-data
    const processedFiles = await processFilesForBackend(files);

    // Determine if this is an audio-only request
    const isAudioOnly = isAudioOnlyRequest(files);
    const hasText = content && content.trim().length > 0;

    // Log the request type for debugging
    if (isAudioOnly && !hasText) {
        console.log("🎵 Routing to audio-only endpoint");
    } else if (isAudioOnly && hasText) {
        console.log("🎵 Audio files with text - using standard endpoint");
    } else {
        console.log("📄 Using standard endpoint");
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add text content and timestamp
    if (content) {
        formData.append("content", content);
    }
    formData.append("timestamp", new Date().toISOString());

    // Add files to FormData
    processedFiles.forEach((file) => {
        formData.append("files", file);
    });

    // Determine endpoint based on file type and content
    let endpoint;
    if (isAudioOnly && !hasText && processedFiles.length > 0) {
        // Audio-only files without text content go to audio endpoint
        endpoint = `${app.dataURL}/api/conversations/${conversationId}/${userId}/stream`;
        // TODO: Will get the correct endpoint here
    } else {
        // Everything else goes to standard endpoint
        endpoint = `${app.dataURL}/api/conversations/${conversationId}/${userId}/stream`;
    }

    try {
        const response = await axios.post(endpoint, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 300000, // 5 minutes timeout
        });

        if (response.data && response.data.final_response) {
            return {
                success: true,
                response: response.data.final_response,
                endpoint: isAudioOnly && !hasText ? "audio" : "standard", // Add endpoint info for debugging
            };
        } else {
            throw new Error("No response received from backend");
        }
    } catch (error) {
        if (error.response) {
            // Server responded with error status
            const statusCode = error.response.status;
            const message =
                error.response.data?.message || error.response.data?.detail;

            switch (statusCode) {
                case 400:
                    throw new Error(
                        message || "Invalid request. Please check your input."
                    );
                case 401:
                    throw new Error("Unauthorized. Please login again.");
                case 403:
                    throw new Error("Access forbidden.");
                case 404:
                    throw new Error("Conversation not found.");
                case 422:
                    throw new Error(
                        message ||
                            "Invalid file format or unsupported audio type."
                    );
                case 429:
                    throw new Error(
                        "Too many requests. Please try again later."
                    );
                case 500:
                    throw new Error("Server error. Please try again later.");
                default:
                    throw new Error(
                        message || `Request failed with status ${statusCode}`
                    );
            }
        } else if (error.request) {
            throw new Error(
                "Network error. Please check your internet connection."
            );
        } else {
            throw new Error(error.message || "An unexpected error occurred.");
        }
    }
}

export const renameConversation = async (conversationId, newTitle) => {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for renameConversation");
        return await mockRenameConversation(conversationId, newTitle);
    }

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

        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete conversation
export const deleteConversation = async (conversationId, userId) => {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for deleteConversation");
        return await mockDeleteConversation(conversationId, userId);
    }

    try {
        const response = await axios.delete(
            `${app.dataURL}/api/conversations/${conversationId}/user/${userId}`
        );

        return response.data;
    } catch (error) {
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
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for sendVoiceMessage");
        return await mockSendVoiceMessage(
            conversationId,
            userId,
            audioBlob,
            onChunk
        );
    }

    try {
        const base64Audio = await audioBlobToBase64(audioBlob);

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
        if (error.response) {
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

// Updated web search function to handle complete response
export async function sendWebSearchRequest(conversationId, query) {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for sendWebSearchRequest");
        return await mockSendWebSearchRequest(conversationId, query);
    }

    const formData = new FormData();

    // Add text content and timestamp
    if (query) {
        formData.append("content", query);
    }
    formData.append("timestamp", new Date().toISOString());

    try {
        const response = await axios.post(
            `${app.dataURL}/api/conversations/${conversationId}/web/search`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 300000, // 5 minutes timeout
            }
        );

        if (response.data && response.data.final_response) {
            return {
                success: true,
                response: response.data.final_response,
            };
        } else {
            throw new Error("No search response received from backend");
        }
    } catch (error) {
        if (error.response) {
            const statusCode = error.response.status;
            const message =
                error.response.data?.message || error.response.data?.detail;

            switch (statusCode) {
                case 400:
                    throw new Error(message || "Invalid search request.");
                case 429:
                    throw new Error(
                        "Search rate limit exceeded. Please try again later."
                    );
                case 500:
                    throw new Error(
                        "Search service error. Please try again later."
                    );
                default:
                    throw new Error(
                        message || `Search failed with status ${statusCode}`
                    );
            }
        } else if (error.request) {
            throw new Error(
                "Network error. Please check your internet connection."
            );
        } else {
            throw new Error(error.message || "Web search failed.");
        }
    }
}

export async function sendTextToVoiceSpeaker(text) {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for sendTextToVoiceSpeaker");
        return await mockSendTextToVoiceSpeaker(text);
    }

    if (!text || typeof text !== "string") {
        console.warn("No valid text provided to convert to speech.");
        return;
    }

    try {
        const response = await axios.post(
            `${app.dataURL}/api/conversations/text_to_speech`,
            { text },
            {
                headers: {
                    "Content-Type": "application/json",
                },
                responseType: "blob", // Expect binary audio
            }
        );

        // Create a blob URL for the audio
        const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create audio element but DON'T play it automatically
        const audio = new Audio(audioUrl);

        console.log("✅ Audio created successfully.");
        // Return both the audio element and URL so the component can control playback
        return {
            status: "success",
            url: audioUrl,
            audio: audio, // Return the audio element for external control
        };
    } catch (error) {
        if (error.response) {
            const message =
                error.response.data?.detail || error.response.statusText;
            console.error(
                `TTS Error: HTTP ${error.response.status}: ${message}`
            );
            throw new Error(
                `TTS Error: HTTP ${error.response.status}: ${message}`
            );
        } else if (error.request) {
            console.error("TTS Error: No response from server.");
            throw new Error("TTS Error: No response from server.");
        } else {
            console.error(`TTS Error: ${error.message}`);
            throw new Error(`TTS Error: ${error.message}`);
        }
    }
}

export async function searchAllChats(query, userId) {
    if (USE_MOCK_API) {
        console.log("🔧 Using mock API for searchAllChats");
        return await mockSearchAllChats(query, userId);
    }

    if (!query || !userId) return [];

    try {
        const response = await axios.get(
            `${app.dataURL}/api/conversations/search`,
            {
                params: {
                    query,
                    userId,
                },
            }
        );

        return response.data || [];
    } catch (error) {
        console.error("Error searching conversations:", error);
        return [];
    }
}

// Export the configuration for easy toggling
export { USE_MOCK_API };
