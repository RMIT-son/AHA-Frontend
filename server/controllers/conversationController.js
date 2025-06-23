const Conversation = require("../models/Conversation");

exports.createConversation = async (req, res) => {
    try {
        const { user_id } = req.body;
        const conversation = new Conversation({ user_id, messages: [] });
        await conversation.save();
        res.status(201).json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { sender, content } = req.body;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
            return res.status(404).json({ error: "Conversation not found" });

        conversation.messages.push({ sender, content, timestamp: new Date() });

        if (sender === "user") {
            const fakeReply = {
                sender: "assistant",
                content: `🤖 Bot reply to: "${content}"`,
                timestamp: new Date(),
            };
            conversation.messages.push(fakeReply);
        }

        await conversation.save();
        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find();
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversationById = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }
        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
