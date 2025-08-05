import axios from "axios";
import { app } from "../config/keys";

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
                console.warn(
                    `Skipping file ${fileData.name}: no valid file data found`
                );
                continue;
            }

            processedFiles.push(fileToUpload);
        } catch (error) {
            console.error(`Error processing file ${fileData.name}:`, error);
        }
    }
    return processedFiles;
};

export const createConversation = async (user_id, content, files = []) => {
  try {
    // Process files to base64
    const processedFiles = await processFilesForBackend(files);

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    
    // Add text content and timestamp
    if (content) {
        formData.append('content', content);
    }
    
    // Add files to FormData
    processedFiles.forEach((file) => {
        formData.append('files', file);
    });
    
    console.log('Sending files:', processedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));

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

    // Process files for multipart/form-data
    const processedFiles = await processFilesForBackend(files);

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

    console.log(
        "Sending files:",
        processedFiles.map((f) => ({
            name: f.name,
            type: f.type,
            size: f.size,
        }))
    );

    try {
        const response = await fetch(
            `${app.dataURL}/api/conversations/${conversationId}/${userId}/stream`,
            {
                method: "POST",
                headers: {
                    // Don't set Content-Type - let the browser set it with boundary for multipart/form-data
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
                body: formData, // Use FormData instead of JSON
            }
        );

        if (!response.ok || !response.body) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
            if (data === "[DONE]") {
                return true; // Signal completion
            }
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

export async function streamWebSearch(conversationId, query, onChunk) {
  const formData = new FormData();
    
  // Add text content and timestamp
  if (query) {
      formData.append('content', query);
    }
  formData.append('timestamp', new Date().toISOString());
    try {
        const response = await fetch(
            `${app.dataURL}/api/conversations/${conversationId}/web/search`,
            {
                method: "POST",
                headers: {
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
                body: formData
            }
        );

        if (!response.ok || !response.body) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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


export async function voiceSpeaker () {
    // TODO: This function will handle the voice speaker functionality when the user click on the speaker icon
}

export async function searchAllChats () {
    // TODO: This function will handle searching context through all chats
}
