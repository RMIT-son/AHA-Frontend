// src/controllers/mockChatApi.js
// Mock responses for testing frontend before backend is ready

// Helper function to simulate API delay
const simulateDelay = (ms = 1000) =>
    new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock conversation ID
const generateMockId = () =>
    `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Mock conversation data
const mockConversations = [
    {
        id: "conv_1",
        title: "Introduction to AI",
        user_id: "user_123",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        messages: [
            {
                id: "msg_1",
                content: "Hello! Can you explain what AI is?",
                role: "user",
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                files: [],
            },
            {
                id: "msg_2",
                content:
                    "Hello! I'd be happy to explain AI (Artificial Intelligence). AI refers to computer systems that can perform tasks that typically require human intelligence, such as learning, reasoning, problem-solving, and understanding language. It encompasses various technologies like machine learning, natural language processing, and computer vision.",
                role: "assistant",
                timestamp: new Date(Date.now() - 86300000).toISOString(),
                files: [],
            },
        ],
    },
    {
        id: "conv_2",
        title: "Python Programming Help",
        user_id: "user_123",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        messages: [
            {
                id: "msg_3",
                content: "I need help with Python loops",
                role: "user",
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                files: [],
            },
            {
                id: "msg_4",
                content:
                    "I'd be happy to help you with Python loops! There are several types of loops in Python:\n\n1. **For loops** - iterate over sequences\n2. **While loops** - repeat while a condition is true\n\nHere are some examples:\n\n```python\n# For loop\nfor i in range(5):\n    print(i)\n\n# While loop\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1\n```\n\nWhat specific aspect of loops would you like to learn more about?",
                role: "assistant",
                timestamp: new Date(Date.now() - 172700000).toISOString(),
                files: [],
            },
        ],
    },
];

// Mock responses for each endpoint

export const mockCreateConversation = async (user_id, content, files = []) => {
    await simulateDelay(800);

    const newConversation = {
        id: generateMockId(),
        title: content
            ? `Chat about: ${content.substring(0, 30)}...`
            : "New Conversation",
        user_id: user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
    };

    // Add to mock storage
    mockConversations.unshift(newConversation);

    return {
        success: true,
        data: newConversation,
    };
};

export const mockGetAllConversations = async (userId) => {
    await simulateDelay(500);

    return {
        success: true,
        data: mockConversations.filter((conv) => conv.user_id === userId),
    };
};

export const mockGetConversationById = async (conversationId) => {
    await simulateDelay(300);

    if (!conversationId || conversationId === "undefined") {
        return null;
    }

    const conversation = mockConversations.find(
        (conv) => conv.id === conversationId
    );

    if (!conversation) {
        return null;
    }

    return {
        success: true,
        data: conversation,
    };
};

export const mockSendMessageToBackend = async (
    conversationId,
    userId,
    content,
    files = []
) => {
    await simulateDelay(2000); // Simulate longer processing time

    // Find conversation
    const convIndex = mockConversations.findIndex(
        (conv) => conv.id === conversationId
    );
    if (convIndex === -1) {
        throw new Error("Conversation not found");
    }

    // Add user message
    const userMessage = {
        id: generateMockId(),
        content: content,
        role: "user",
        timestamp: new Date().toISOString(),
        files: files.map((file) => ({
            name: file.name || "uploaded_file",
            type: file.type || "application/octet-stream",
            size: file.size || 0,
        })),
    };

    mockConversations[convIndex].messages.push(userMessage);

    // Generate AI response based on content
    let aiResponse = "";
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("hello") || lowerContent.includes("hi")) {
        aiResponse =
            "Hello! How can I help you today? I'm here to assist with any questions or tasks you might have.";
    } else if (
        lowerContent.includes("code") ||
        lowerContent.includes("programming")
    ) {
        aiResponse =
            "I'd be happy to help you with coding! I can assist with various programming languages like Python, JavaScript, Java, and more. What specific programming question or challenge are you working on?";
    } else if (
        lowerContent.includes("explain") ||
        lowerContent.includes("what is")
    ) {
        aiResponse = `Great question! Let me explain that for you. Based on your query about "${content}", I can provide detailed information and examples to help you understand the concept better. Would you like me to break it down into simpler terms or provide specific examples?`;
    } else if (lowerContent.includes("help")) {
        aiResponse =
            "I'm here to help! I can assist you with a wide variety of tasks including answering questions, explaining concepts, helping with coding, writing, analysis, and much more. What would you like help with today?";
    } else if (files && files.length > 0) {
        aiResponse = `I can see you've uploaded ${files.length} file(s). I can help analyze images, documents, and other files. Based on what you've shared, I can provide insights, answer questions about the content, or help you work with the information in the files.`;
    } else {
        aiResponse = `Thank you for your message: "${content}". I understand you're asking about this topic. Let me provide you with a comprehensive response. This is a mock response for testing purposes, but in the real implementation, I would analyze your question and provide relevant, helpful information tailored to your specific needs.`;
    }

    // Add AI response
    const assistantMessage = {
        id: generateMockId(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date().toISOString(),
        files: [],
    };

    mockConversations[convIndex].messages.push(assistantMessage);
    mockConversations[convIndex].updated_at = new Date().toISOString();

    return {
        success: true,
        response: aiResponse,
    };
};

export const mockRenameConversation = async (conversationId, newTitle) => {
    await simulateDelay(300);

    const convIndex = mockConversations.findIndex(
        (conv) => conv.id === conversationId
    );
    if (convIndex === -1) {
        throw new Error("Conversation not found");
    }

    mockConversations[convIndex].title = newTitle;
    mockConversations[convIndex].updated_at = new Date().toISOString();

    return {
        success: true,
        data: mockConversations[convIndex],
    };
};

export const mockDeleteConversation = async (conversationId, userId) => {
    await simulateDelay(300);

    const convIndex = mockConversations.findIndex(
        (conv) => conv.id === conversationId && conv.user_id === userId
    );

    if (convIndex === -1) {
        throw new Error("Conversation not found");
    }

    mockConversations.splice(convIndex, 1);

    return {
        success: true,
        message: "Conversation deleted successfully",
    };
};

export const mockSendVoiceMessage = async (
    conversationId,
    userId,
    audioBlob,
    onChunk
) => {
    await simulateDelay(1500);

    // Mock transcription responses
    const mockTranscriptions = [
        "Hello, can you help me with my project?",
        "What's the weather like today?",
        "Explain machine learning to me",
        "How do I write a for loop in Python?",
        "Can you summarize this document for me?",
    ];

    const transcribedText =
        mockTranscriptions[
            Math.floor(Math.random() * mockTranscriptions.length)
        ];

    if (onChunk && transcribedText) {
        onChunk(transcribedText);
    }

    return {
        conversationId: conversationId,
        success: true,
        transcribedText: transcribedText,
    };
};

export const mockSendWebSearchRequest = async (conversationId, query) => {
    await simulateDelay(2500);

    const searchResponse = `I've searched for information about "${query}". Here are the key findings:

**Search Results:**
1. **Primary Information**: Based on current web sources, here's what I found about your query.

2. **Recent Updates**: The latest information shows several relevant developments in this area.

3. **Expert Opinions**: Various experts in the field have shared insights that might be helpful for your question.

**Summary**: This is a mock web search response. In the actual implementation, this would contain real search results from web sources, formatted and summarized for easy reading.

*Note: This is a simulated response for testing purposes.*`;

    return {
        success: true,
        response: searchResponse,
    };
};

export const mockSendTextToVoiceSpeaker = async (text) => {
    await simulateDelay(1000);

    if (!text || typeof text !== "string") {
        console.warn("No valid text provided to convert to speech.");
        return;
    }

    // Create a mock audio URL (you can replace this with an actual audio file URL for testing)
    const mockAudioUrl =
        "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////TAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    console.log(
        "🎵 Mock TTS: Playing audio for text:",
        text.substring(0, 50) + "..."
    );

    return {
        status: "success",
        url: mockAudioUrl,
        message: "Mock audio generated successfully",
    };
};

export const mockSearchAllChats = async (query, userId) => {
    await simulateDelay(500);

    if (!query || !userId) return [];

    // Mock search results
    const searchResults = mockConversations
        .filter((conv) => conv.user_id === userId)
        .filter((conv) => {
            const queryLower = query.toLowerCase();
            return (
                conv.title.toLowerCase().includes(queryLower) ||
                conv.messages.some((msg) =>
                    msg.content.toLowerCase().includes(queryLower)
                )
            );
        })
        .map((conv) => ({
            conversation_id: conv.id,
            title: conv.title,
            matched_messages: conv.messages
                .filter((msg) =>
                    msg.content.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 3), // Limit to 3 matches per conversation
            last_updated: conv.updated_at,
        }));

    return searchResults;
};
