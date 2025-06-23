const mongoose = require("mongoose");
const MessageSchema = require("./Message");

const ConversationSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    messages: [MessageSchema],
});

module.exports = mongoose.model("Conversation", ConversationSchema);
