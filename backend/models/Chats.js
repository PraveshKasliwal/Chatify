const mongoose = require("mongoose");

const ChatsSchema = new mongoose.Schema({
    type: { type: String, enum: ["dm", "group"], default: "dm" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupName: String,
    profileImage: String,
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    time: { type: Date, default: Date.now }
}, {timestamps: true });

module.exports = mongoose.model("Chat", ChatsSchema);