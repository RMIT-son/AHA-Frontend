const express = require("express");
const router = express.Router();
const {
    createConversation,
    sendMessage,
    getConversations,
    getConversationById,
} = require("../controllers/conversationController");

router.post("/", createConversation);
router.post("/:conversationId/message", sendMessage);
router.get("/", getConversations);
router.get("/:conversationId", getConversationById);

module.exports = router;
