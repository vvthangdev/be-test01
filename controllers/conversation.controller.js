
const message = require('../models/message');
const User = require('../models/user.model');
const conversationService = require('../services/conversation.service');

const createConversation = async (req, res) => { 
    // user1_id, user2_id, "message", first user message -> user1 
    try {

        const { user1_id, user2_id, message } = req.body; // object

        if (!user1_id || !user2_id || !message) { 
            return res.status(400).json({
                status: "error",
                message: "Bad request: Missing required fields"
            });    
        }
    

        const conversation = await conversationService.createConversation({user1_id, user2_id, message});

        return res.json({
            status: "success",
            message: "Conversation created successfully",
            data: conversation
        });

    } catch(e) { 

        console.log(e);

        res.status(500).json({
            status: "error",
            message: e,
        });
    }
};
// user-id
const getListConversations = async (req, res) => {
    try {
        const user = req.user;

        const conversations = await conversationService.getListConversations(user.id);
        if (!conversations) { 
            return res.status(404).json({
                status: "error",
                message: "No conversation found"
            });
        }
        return res.json({
            status: "success",
            message: "Fetching conversations successfully",
            data: conversations
        });
    } catch(e) {
        console.log(e);
        return res.status(500).json({
           status: "error",
           message: "An error occured while fetching conversations" 
        });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const conversationId = req.params.conversation_id;
        
        await conversationService.deleteConversation(conversationId);
    } catch(e) {
        if (e.code === 404) {
            return res.status(404).json({
                status: "error",
                message: e.message,
            });
        } else {
            return res.status(500).json({
                status: "error",
                message: "An error occured while deleting conversation"
            });
        }
    }
};

const getListMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversation_id;
        const messages = conversationService.getListMessages(conversationId); 
        if (!messages) { 
            return res.status(404).json({
                status: "error",
                message: "No message found"
            });
        }
        return res.json({
            status: "success",
            message: "Get messages of conversation successfully",
            data: messages
        });
    } catch(e) {
        res.status(500).json( {
            status: "error",
            message: "An error occured while getting list message"
        });
    }
};

const deleteMessage = async (req, res) => {
    try { 
        const messageId = req.params.message_id;
        await conversationService.deleteMessage(messageId);
    } catch(e) { 
        if (e.code === 404) {
            return res.status(404).json({
                status: "error",
                message: e.message,
            });
        } else {
            return res.status(500).json({
                status: "error",
                message: "An error occured while deleting message"
            });
        }
    }
};

module.exports = {
    createConversation,
    getListConversations,
    deleteConversation,
    getListMessages,
    deleteMessage
};