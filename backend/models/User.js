const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    number: {
        type: String,
        unique: true
    },
    profileImage: String,
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }]
});

module.exports = mongoose.model("User", UserSchema);