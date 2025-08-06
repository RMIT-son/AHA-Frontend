import axios from "axios";
import { app } from "../config/keys";

/**
 * Conversation API Service
 *
 * This module provides comprehensive API functions for managing conversations,
 * including file uploads, streaming responses, voice messages, and web search functionality.
 *
 * @module ConversationAPI
 * @version 1.0.0
 */

/**
 * Converts a base64 string to a File object
 *
 * @param {string} base64String - The base64 encoded string
 * @param {string} fileName - The desired filename for the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<File>} A promise that resolves to a File object
 * @private
 */
const base64ToFile = async (base64String, fileName, mimeType) => {
    // Remove data URL prefix if present (e.g., "data:image/png;base64,")
    const base64Data = base64String.replace(/^data:[^;]+;base64,/, "");

    // Convert base64 to binary string
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);

    // Convert binary string to byte array
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return new File([base64String], fileName, { type: mimeType });
};

/**
 * Processes file data for backend upload, converting various file formats to File objects
 *
 * This function handles different file input formats:
 * - Direct File objects
 * - Base64 encoded images with preview data
 * - Raw file data
 *
 * @param {Array} files - Array of file data objects containing file information
 * @returns {Promise<Array<File>>} Array of processed File objects ready for upload
 * @private
 */
const processFilesForBackend = async (files) => {
    if (!files || files.length === 0) return [];

    const processedFiles = [];

    for (const fileData of files) {
        try {
            let fileToUpload;

            if (fileData.file instanceof File) {
                // Direct File object - use as is
                fileToUpload = fileData.file;
            } else if (fileData.preview && fileData.type.startsWith("image/")) {
                // Base64 image data - convert to File object
                fileToUpload = await base64ToFile(
                    fileData.preview,
                    fileData.name,
                    fileData.type
                );
            } else if (fileData.file) {
                // Raw file data - use directly
                fileToUpload = fileData.file;
            } else {
                // Invalid file data - skip with warning
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

/**
 * Creates a new conversation with optional file attachments
 *
 * @param {string} user_id - The unique identifier of the user creating the conversation
 * @param {string} content - The initial message content for the conversation
 * @param {Array} [files=[]] - Optional array of file objects to attach to the conversation
 * @returns {Promise<Object>} The created conversation data from the server
 * @throws {Error} Throws error if conversation creation fails
 * @public
 */
export const createConversation = async (user_id, content, files = []) => {
    try {
        // Process and prepare files for multipart upload
        const processedFiles = await processFilesForBackend(files);

        // Create FormData for multipart/form-data request
        const formData = new FormData();

        // Add text content if provided
        if (content) {
            formData.append("content", content);
        }

        // Attach all processed files to the form data
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
        console.error("Failed to create conversation", error);
        throw error;
    }
};

/**
 * Retrieves all conversations for a specific user
 *
 * @param {string} userId - The unique identifier of the user
 * @returns {Promise<Array>} Array of conversation objects, or empty array if request fails
 * @public
 */
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

/**
 * Retrieves a specific conversation by its ID
 *
 * @param {string} conversationId - The unique identifier of the conversation
 * @returns {Promise<Object|null>} The conversation object, or null if not found/invalid ID
 * @public
 */
export const getConversationById = async (conversationId) => {
    // Validate conversation ID
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

export async function streamFromBackend(
    conversationId,
    userId,
    content,
    onChunk,
    files = []
) {
    // Validate required conversation ID
    if (!conversationId || conversationId === "undefined") {
        throw new Error("Conversation ID is required");
    }

    // Process files for multipart upload
    const processedFiles = await processFilesForBackend(files);

    // Prepare multipart form data
    const formData = new FormData();

    if (content) {
        formData.append("content", content);
    }

    // Add timestamp for request tracking
    formData.append("timestamp", new Date().toISOString());

    // Attach all processed files
    processedFiles.forEach((file) => {
        formData.append("files", file);
    });

    try {
        const response = await fetch(
            `${app.dataURL}/api/conversations/${conversationId}/${userId}/stream`,
            {
                method: "POST",
                headers: {
                    // Let browser set Content-Type with boundary for multipart/form-data
                    Accept: "text/event-stream",
                    "Cache-Control": "no-cache",
                    Connection: "keep-alive",
                },
                body: formData,
            }
        );

        if (!response.ok || !response.body) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Set up streaming reader
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // Sentence buffering variables
        let sentenceBuffer = "";
        let lastFlushTime = Date.now();
        const FLUSH_TIMEOUT = 800; // Force flush after 800ms

        try {
            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    // Flush any remaining content when stream ends
                    if (sentenceBuffer.trim()) {
                        console.log(
                            "Final flush:",
                            JSON.stringify(sentenceBuffer)
                        );
                        onChunk?.(sentenceBuffer);
                    }
                    break;
                }

                // Decode and buffer incoming data
                buffer += decoder.decode(value, { stream: true });
                console.log("Received chunk:", JSON.stringify(buffer));

                // Process complete SSE events (delimited by \n\n)
                let eventEndIndex;
                while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
                    const event = buffer.slice(0, eventEndIndex);
                    buffer = buffer.slice(eventEndIndex + 2);

                    // Process event and accumulate in sentence buffer
                    const chunkData = processSSEEvent(event);
                    if (chunkData !== null) {
                        console.log(
                            "Adding to buffer:",
                            JSON.stringify(chunkData)
                        );
                        sentenceBuffer += chunkData;

                        console.log(
                            "Current buffer:",
                            JSON.stringify(sentenceBuffer)
                        );

                        // Check if we should flush the sentence buffer
                        const shouldFlush = shouldFlushSentenceBuffer(
                            sentenceBuffer,
                            lastFlushTime,
                            FLUSH_TIMEOUT
                        );
                        console.log("Should flush?", shouldFlush);

                        if (shouldFlush) {
                            console.log(
                                "Flushing buffer:",
                                JSON.stringify(sentenceBuffer)
                            );
                            onChunk?.(sentenceBuffer);
                            sentenceBuffer = "";
                            lastFlushTime = Date.now();
                        }
                    }
                }

                // Fallback for servers that don't send proper \n\n delimiters
                if (!buffer.includes("\n\n") && buffer.includes("\n")) {
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.trim().startsWith("data: ")) {
                            const data = line.trim().slice(6);
                            if (data === "[DONE]") {
                                // Flush any remaining content before ending
                                if (sentenceBuffer.trim()) {
                                    console.log(
                                        "Final flush on DONE:",
                                        JSON.stringify(sentenceBuffer)
                                    );
                                    onChunk?.(sentenceBuffer);
                                }
                                return;
                            }

                            console.log(
                                "Fallback adding to buffer:",
                                JSON.stringify(data)
                            );

                            // Accumulate in sentence buffer instead of direct onChunk
                            sentenceBuffer += data;

                            console.log(
                                "Fallback current buffer:",
                                JSON.stringify(sentenceBuffer)
                            );

                            // Check if we should flush
                            const shouldFlush = shouldFlushSentenceBuffer(
                                sentenceBuffer,
                                lastFlushTime,
                                FLUSH_TIMEOUT
                            );
                            console.log("Fallback should flush?", shouldFlush);

                            if (shouldFlush) {
                                console.log(
                                    "Fallback flushing buffer:",
                                    JSON.stringify(sentenceBuffer)
                                );
                                onChunk?.(sentenceBuffer);
                                sentenceBuffer = "";
                                lastFlushTime = Date.now();
                            }
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

// Helper functions
function shouldFlushSentenceBuffer(buffer, lastFlushTime, timeout) {
    if (!buffer.trim()) return false;

    // Force flush if timeout exceeded
    if (Date.now() - lastFlushTime > timeout) return true;

    // Don't flush on very short content (avoid premature flushing)
    if (buffer.length < 10) return false;

    // Flush on complete sentences (must end with punctuation + space or newline)
    if (/[.!?](\s+|$)/.test(buffer)) return true;

    // Flush on paragraph breaks (double newlines)
    if (/\n\n/.test(buffer)) return true;

    // Flush on complete markdown structures with content
    if (/\n###\s+.+/.test(buffer)) return true; // Complete header with text
    if (/\*\*[^*]+\*\*\s*\n/.test(buffer)) return true; // Bold text followed by newline

    // Flush on numbered list items that are complete
    if (/\n\d+\.\s+.+[.!?]/.test(buffer)) return true;

    // Flush on bullet points that are complete
    if (/\n\s*[-*]\s+.+[.!?]/.test(buffer)) return true;

    // Flush on horizontal rules
    if (/\n---\n/.test(buffer)) return true;

    // Force flush if buffer gets very long (safety valve)
    if (buffer.length > 500) return true;

    return false;
}

function processSSEEvent(event) {
    for (const line of event.split("\n")) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("data: ")) {
            const data = trimmedLine.slice(6);
            if (data === "[DONE]") {
                return null; // Signal completion
            }
            return data; // Return the data instead of calling onChunk directly
        }
    }
    return null;
}

/**
 * Updates the title of an existing conversation
 *
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} newTitle - The new title for the conversation
 * @returns {Promise<Object>} The updated conversation data
 * @throws {Error} Throws error if rename operation fails
 * @public
 */
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

        return response.data;
    } catch (error) {
        console.error("Error renaming conversation:", error);
        throw error;
    }
};

/**
 * Permanently deletes a conversation for a specific user
 *
 * @param {string} conversationId - The unique identifier of the conversation to delete
 * @param {string} userId - The unique identifier of the user requesting deletion
 * @returns {Promise<Object>} Confirmation data from the server
 * @throws {Error} Throws error if deletion fails
 * @public
 */
export const deleteConversation = async (conversationId, userId) => {
    try {
        const response = await axios.delete(
            `${app.dataURL}/api/conversations/${conversationId}/user/${userId}`
        );

        return response.data;
    } catch (error) {
        console.error("Error deleting conversation:", error);
        throw error;
    }
};

/**
 * Converts an audio Blob to base64 encoded string
 *
 * @param {Blob} blob - The audio blob to convert
 * @returns {Promise<string>} A promise that resolves to the base64 encoded audio data
 * @private
 */
const audioBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            // Extract base64 data (remove the data URL prefix)
            const base64Only = dataUrl.split(",")[1];
            resolve(base64Only);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
};

/**
 * Sends voice message for speech-to-text transcription
 *
 * This function converts audio blob to base64, sends it to the transcription service,
 * and returns the transcribed text along with conversation metadata.
 *
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} userId - The unique identifier of the user
 * @param {Blob} audioBlob - The audio blob containing the voice message
 * @param {Function} onChunk - Callback function to handle transcription result
 * @returns {Promise<Object>} Object containing conversation ID, success status, and transcribed text
 * @throws {Error} Throws detailed error if transcription fails
 * @public
 */
export const sendVoiceMessage = async (
    conversationId,
    userId,
    audioBlob,
    onChunk
) => {
    try {
        // Convert audio blob to base64 for API transmission
        const base64Audio = await audioBlobToBase64(audioBlob);

        // Send transcription request
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

        // Execute callback with transcribed text if provided
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

        // Provide detailed error information based on error type
        if (error.response) {
            // Server responded with error status
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            throw new Error(
                `HTTP ${error.response.status}: ${
                    error.response.data?.detail || error.response.statusText
                }`
            );
        } else if (error.request) {
            // Network error - no response received
            throw new Error("Network error: No response received from server");
        } else {
            // Other error types
            throw error;
        }
    }
};

/**
 * Initiates a streaming web search within a conversation context
 *
 * This function sends a search query to the backend and establishes a streaming
 * connection to receive real-time search results and processing updates.
 *
 * @param {string} conversationId - The unique identifier of the conversation
 * @param {string} query - The search query string
 * @param {Function} onChunk - Callback function to handle streaming search results
 * @throws {Error} Throws error if search request fails or streaming encounters issues
 * @public
 */
export async function streamWebSearch(conversationId, query, onChunk) {
    const formData = new FormData();

    // Prepare search request data
    if (query) {
        formData.append("content", query);
    }
    formData.append("timestamp", new Date().toISOString());

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
                body: formData,
            }
        );

        if (!response.ok || !response.body) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Set up streaming reader for real-time results
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Process incoming stream data
                buffer += decoder.decode(value, { stream: true });

                // Handle complete SSE events
                let eventEndIndex;
                while ((eventEndIndex = buffer.indexOf("\n\n")) !== -1) {
                    const event = buffer.slice(0, eventEndIndex);
                    buffer = buffer.slice(eventEndIndex + 2);
                    processSSEEvent(event, onChunk);
                }

                // Fallback processing for incomplete event delimiters
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

export async function voiceSpeaker() {
    // TODO: This function will handle the voice speaker functionality when the user click on the speaker icon
}

export async function searchAllChats() {
    // TODO: This function will handle searching context through all chats
}
