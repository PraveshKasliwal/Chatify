const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat");
const upload = require("../utils/s3Uploader");

router.get("/users", chatController.searchUserByPhoneNumber);

router.get('/users/all', chatController.getAllUsers);

router.post("/create", chatController.createChat);

router.get("/user-chats/:userId", chatController.getUserChats);

router.get("/get-messages/:chatId", chatController.getMessages);

router.post("/send-message", chatController.postMessages);

router.delete("/delete-chat/:chatId/:userId", chatController.deleteChat);

router.post('/summarize', chatController.summarizeMessages);

router.delete("/delete-messages/:chatId", chatController.deleteMessages);

router.post("/upload-image", upload.single("image"), chatController.uploadChatImage);

module.exports = router;
