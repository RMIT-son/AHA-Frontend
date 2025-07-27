import { useEffect } from "react";
import { getConversationById } from "../controllers/chat";

/**
 * Custom hook for managing chat data loading and conversation state
 *
 * This hook handles the complex logic of loading chat conversations, normalizing
 * message data, and managing conversation state based on the current route parameters.
 * It ensures proper message ordering and handles various edge cases for chat loading.
 *
 * @param {Object} config - Configuration object containing state setters and data
 * @param {string|null} config.id - Current chat/conversation ID from URL parameters
 * @param {string|null} config.userId - Authenticated user's ID
 * @param {React.MutableRefObject} config.skipNextLoadRef - Ref to control load skipping
 * @param {Function} config.setChatId - State setter for current active chat ID
 * @param {Function} config.setMessages - State setter for chat messages array
 * @param {Function} config.validateMessageOrder - Function to validate message sequence integrity
 * @param {Function} config.refreshConversationList - Function to refresh the conversation sidebar
 * @param {Function} config.setHasLoaded - State setter to indicate data loading completion
 *
 * @example
 * // Usage in a chat component
 * useChatData({
 *   id: chatIdFromUrl,
 *   userId: currentUserId,
 *   skipNextLoadRef: skipLoadRef,
 *   setChatId: setChatIdState,
 *   setMessages: setMessagesState,
 *   validateMessageOrder: validateFunction,
 *   refreshConversationList: refreshFunction,
 *   setHasLoaded: setLoadedState
 * });
 *
 * @author Your Team Name
 * @since 1.0.0
 */
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
        /**
         * Asynchronous function to load and process chat conversation data
         * Handles multiple scenarios: new chats, existing conversations, and error states
         */
        const loadChatData = async () => {
            // Guard clause: Don't proceed if user is not authenticated
            if (!userId) return;

            try {
                /**
                 * Skip loading mechanism
                 * Used to prevent redundant API calls when navigating programmatically
                 * (e.g., after creating a new conversation)
                 */
                if (id && id === skipNextLoadRef.current) {
                    skipNextLoadRef.current = null; // Reset the skip flag
                    return;
                }

                /**
                 * Handle new conversation scenario
                 * When user accesses /chat/new or /chat without an ID
                 */
                if (id === "new" || !id) {
                    setChatId(null); // Clear current chat ID
                    setMessages([]); // Clear message history
                } else if (id && id !== "undefined") {
                /**
                 * Handle existing conversation loading
                 * Validate ID and fetch conversation data from API
                 */
                    // Fetch conversation data from backend
                    const res = await getConversationById(id);

                    // Verify response contains valid message data
                    if (res && res.messages) {
                        setChatId(id); // Set active conversation ID

                        /**
                         * Message normalization process
                         * Ensures consistent message format and proper sender attribution
                         * Handles legacy data and maintains conversation flow integrity
                         */
                        const normalizedMessages = res.messages.map(
                            (msg, index) => {
                                // Normalize sender field to lowercase and trim whitespace
                                let sender = msg.sender?.toLowerCase?.().trim();

                                // Handle legacy "assistant" sender type
                                if (sender === "assistant") sender = "bot";

                                /**
                                 * Message order validation and correction
                                 * Enforces alternating user/bot pattern for proper conversation flow
                                 * Even indices (0, 2, 4...) should be user messages
                                 * Odd indices (1, 3, 5...) should be bot messages
                                 */
                                if (index % 2 === 0) {
                                    // Even index should be user message
                                    if (sender !== "user") {
                                        console.warn(
                                            `Message at index ${index} corrected: ${sender} -> user`
                                        );
                                        sender = "user";
                                    }
                                } else {
                                    // Odd index should be bot message
                                    if (sender !== "bot") {
                                        console.warn(
                                            `Message at index ${index} corrected: ${sender} -> bot`
                                        );
                                        sender = "bot";
                                    }
                                }

                                // Return normalized message object
                                return { ...msg, sender };
                            }
                        );

                        // Validate the overall message sequence integrity
                        validateMessageOrder(normalizedMessages);

                        // Update application state with normalized messages
                        setMessages(normalizedMessages);
                    } else {
                        /**
                         * Handle invalid or empty conversation response
                         * Reset to new conversation state if data is corrupted/missing
                         */
                        setChatId(null);
                        setMessages([]);
                    }
                }

                /**
                 * Refresh conversation list in sidebar
                 * Ensures UI reflects any changes in conversation metadata
                 */
                await refreshConversationList(userId);

                // Mark data loading as complete
                setHasLoaded(true);
            } catch (error) {
                /**
                 * Error handling for failed conversation loading
                 * Logs error details for debugging while maintaining app stability
                 */
                console.error("Error loading chat data:", error);
                // Note: Consider adding user-facing error handling here in production
            }
        };

        // Execute the data loading function
        loadChatData();
    }, [id, userId]); // Dependencies: re-run when chat ID or user ID changes
}

/**
 * Message normalization rationale:
 * - Ensures consistent conversation flow (user -> bot -> user -> bot...)
 * - Handles legacy data where "assistant" was used instead of "bot"
 * - Corrects any data corruption that might break conversation UI
 * - Provides debugging information through console warnings
 *
 * Performance considerations:
 * - Uses skipNextLoadRef to prevent unnecessary API calls
 * - Only processes messages when valid response is received
 * - Efficient array mapping for message normalization
 *
 * Error handling:
 * - Graceful degradation on API failures
 * - Fallback to empty conversation state on data corruption
 * - Comprehensive logging for debugging
 */
