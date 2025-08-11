const User = require("../models/User");
const Chat = require("../models/Chats");
const Message = require("../models/Message");
const axios = require("axios");

exports.searchUserByPhoneNumber = async (req, res) => {
    const { phone } = req.query;
    try {
        const user = await User.findOne({ number: phone });
        // console.log(user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error searching user" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

exports.createChat = async (req, res) => {
    const { memberIds, groupName, creatorId, profileImage } = req.body;
    const io = req.app.get("io");

    try {
        if (!creatorId) {
            return res.status(400).json({ message: "Creator ID is required" });
        }

        let members = Array.isArray(memberIds) ? [...memberIds] : [memberIds];
        const isGroup = members.length > 1;

        // Ensure creator is part of group
        if (isGroup) {
            if (!members.includes(creatorId)) {
                members.push(creatorId);
            }
        } else {
            // Validate DM request
            if (members.length !== 1) {
                return res.status(400).json({ message: "Invalid DM request" });
            }
            members = [creatorId, members[0]];

            // ✅ Check if DM already exists (exact same members)
            const existingChat = await Chat.findOne({
                type: "dm",
                members: { $size: 2, $all: members },
            });

            if (existingChat) {
                return res.status(400).json({ message: "DM already exists between these users" });
            }
        }

        // ✅ Handle profile image
        let finalProfileImage = profileImage || null;
        if (!isGroup) {
            const recipientId = members.find((m) => m !== creatorId);
            const recipient = await User.findById(recipientId).select("profileImage");
            finalProfileImage = recipient?.profileImage || null;
        }

        // ✅ Create new chat
        const newChat = new Chat({
            type: isGroup ? "group" : "dm",
            members,
            groupName: isGroup ? groupName : null,
            profileImage: finalProfileImage,
        });

        const savedChat = await newChat.save();

        // ✅ Add chat to all member's chat list
        await User.updateMany(
            { _id: { $in: members } },
            { $push: { chats: savedChat._id } }
        );

        // ✅ Populate members before emitting
        const populatedChat = await Chat.findById(savedChat._id)
            .populate("members", "username profileImage");

        // ✅ Emit chat to all members in socket
        members.forEach((id) => {
            io.to(id).emit("new-chat", populatedChat);
            console.log(`Emitted new chat to user ${id}`);
        });

        res.status(201).json({ message: "Chat created", chat: populatedChat });

    } catch (err) {
        console.error("Error creating chat:", err);
        res.status(500).json({ message: "Failed to create chat" });
    }
};

exports.getUserChats = async (req, res) => {
    const { userId } = req.params;
    const io = req.app.get("io");

    try {
        const user = await User.findById(userId).populate({
            path: "chats",
            populate: {
                path: "members",
                select: "username profileImage",
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Format chats
        const formattedChats = user.chats.map(chat => {
            const isGroup = chat.type === "group";
            return {
                _id: chat._id,
                type: chat.type,
                members: chat.members,
                groupName: isGroup ? chat.groupName : null,
                profileImage: chat.profileImage || null,
            };
        });

        // Emit updated chats to the user via socket
        io.to(userId).emit("chats-list", formattedChats);

        // Send response back to frontend
        res.json(formattedChats);

    } catch (err) {
        console.error("Error fetching user chats:", err);
        res.status(500).json({ message: "Failed to get user chats" });
    }
};


exports.getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        // Populate the senderId field to get username and other user info
        const messages = await Message.find({ chatId }).populate({
            path: "senderId",
            select: "username", // Only get the username
        });

        // Map the messages to add senderUsername
        const formattedMessages = messages.map(msg => ({
            _id: msg._id,
            chatId: msg.chatId,
            text: msg.text,
            type: msg.type || "text",
            senderId: msg.senderId._id,
            senderUsername: msg.senderId.username,
            createdAt: msg.createdAt,
        }));

        res.status(200).json(formattedMessages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

exports.postMessages = async (req, res) => {
    const { chatId, senderId, text, type } = req.body;

    try {
        //get sender username
        const sender = await User.findById(senderId);
        const senderUsername = sender ? sender.username : 'Unknown';
        // console.log(senderUsername);

        const newMessage = new Message({ chatId, senderId, text });
        await newMessage.save();

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { messages: newMessage._id } },
            { new: true }
        ).populate("members");

        if (!updatedChat || !updatedChat.members || updatedChat.members.length === 0) {
            return res.status(500).json({ error: "Chat members not found" });
        }

        const io = req.app.get("io");
        //for real time 
        updatedChat.members.forEach(member => {
            if (member._id.toString() !== senderId) {
                io.to(member._id.toString()).emit("new-message", {
                    ...newMessage._doc,
                    senderUsername: senderUsername,
                    chatId: chatId,
                    senderId: senderId
                });
            }
        });

        res.status(201).json({
            ...newMessage._doc,
            senderUsername: senderUsername
        });

    } catch (err) {
        console.error("Error in postMessages:", err);
        res.status(500).json({ error: "Message send failed", err });
    }
};

exports.uploadChatImage = async (req, res) => {
    try {
        if (!req.file || !req.file.location) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { chatId, senderId } = req.body;
        const imageUrl = req.file.location;

        const sender = await User.findById(senderId);
        const senderUsername = sender ? sender.username : "Unknown";

        // Save message as type=image
        const newMessage = new Message({
            chatId,
            senderId,
            text: imageUrl,
            type: "image"
        });
        await newMessage.save();

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { messages: newMessage._id } },
            { new: true }
        ).populate("members");

        const io = req.app.get("io");
        updatedChat.members.forEach(member => {
            if (member._id.toString() !== senderId) {
                io.to(member._id.toString()).emit("new-message", {
                    ...newMessage._doc,
                    senderUsername,
                    chatId
                });
            }
        });

        res.status(201).json({
            ...newMessage._doc,
            senderUsername
        });

    } catch (err) {
        console.error("Error uploading chat image:", err);
        res.status(500).json({ error: "Image upload failed" });
    }
};

exports.deleteChat = async (req, res) => {
    const { chatId, userId } = req.params;

    try {
        const chat = await Chat.findById(chatId).populate("members");

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const affectedUsers = chat.members.map(m => m._id.toString());
        const io = req.app.get("io");
        //for dm
        if (chat.type === "dm") {
            await Message.deleteMany({ chatId });
            // remove chat from user schema
            await Promise.all(
                affectedUsers.map(uid =>
                    User.findByIdAndUpdate(uid, { $pull: { chats: chatId } })
                )
            );

            await Chat.findByIdAndDelete(chatId);
            //emit socket
            affectedUsers.forEach(uid => {
                io.to(uid).emit("chat-deleted", { chatId });
                // console.log(`Emitted chat-deleted to user ${uid}`);
            });

        } else {
            // remove user from group
            await Chat.findByIdAndUpdate(chatId, {
                $pull: { members: userId }
            });

            // remove chat from user
            await User.findByIdAndUpdate(userId, {
                $pull: { chats: chatId }
            });

            // Check members after removal
            const updatedChat = await Chat.findById(chatId);

            if (updatedChat.members.length === 0) {
                await Message.deleteMany({ chatId }); // clean messages
                await Chat.findByIdAndDelete(chatId);
                console.log(`Deleted complete chat after last member left`);
            }

            // console.log(`updatedChat after removal:`, updatedChat);

            // Emit to all users who had the chat
            const io = req.app.get("io");
            io.to(userId.toString()).emit("chat-deleted", { chatId: chatId.toString() });
            // console.log(`Emitted chat-deleted to chat ${userId}`);
        }

        res.status(200).json({ message: "Chat deleted successfully" });

    } catch (err) {
        console.error("Error deleting chat:", err);
        res.status(500).json({ error: "Failed to delete chat" });
    }
};


const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.APP_GEMINI_API_KEY);

exports.summarizeMessages = async (req, res) => {
    const { messages } = req.body;

    const prompt = `Summarize the following conversation:\n${messages.map(msg => `${msg.senderUsername}: ${msg.text}`).join('\n')}`;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Gemini error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
};

exports.deleteMessages = async (req, res) => {
    const { chatId } = req.params;
    const { messageIds } = req.body; // Array of message IDs
    const io = req.app.get("io");

    try {
        // Delete messages from DB
        await Message.deleteMany({ _id: { $in: messageIds } });

        // Remove message references from chat
        await Chat.findByIdAndUpdate(chatId, {
            $pull: { messages: { $in: messageIds } }
        });

        // Notify all users in chat
        io.to(chatId).emit("message-deleted", { chatId, messageIds });

        res.status(200).json({ message: "Messages deleted successfully" });
    } catch (err) {
        console.error("Error deleting messages:", err);
        res.status(500).json({ error: "Failed to delete messages" });
    }
};
