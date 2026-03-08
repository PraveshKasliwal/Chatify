const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text: String, // URL for image or text
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  type: {
    type: String,
    enum: ["text", "image"],
    default: "text"
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);