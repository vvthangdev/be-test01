const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversation.controller");
const { route } = require("./user.routes");
const authMiddleWare = require("../middlewares/auth.middleware");

// req: payload: {user1, user2, lastmessage}
router.post(
  "/",
  authMiddleWare.authenticateToken,
  conversationController.createConversation
); // create conversation

router.get('/', authMiddleWare.authenticateToken, conversationController.getListConversations); // get list conversations of user

router.delete('/:conversationId', authMiddleWare.authenticateToken, conversationController.deleteConversation); // delete conversation

// router.post('message/:conversationId', authMiddleWare.authenticateToken, conversationController.sendMessage); // send mesaage to conversation

router.delete('message/:conversationId/:messageId', authMiddleWare.authenticateToken, conversationController.deleteMessage) //delete message

router.get('/:conversationId', authMiddleWare.authenticateToken, conversationController.getListMessages) // get all messages of conversation

module.exports = router;
