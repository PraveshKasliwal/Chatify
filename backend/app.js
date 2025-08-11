const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");
dotenv.config();
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);

const authRoutes = require('./routes/authRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const chatRoutes = require('./routes/chatRoutes.js');

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

const allowedOrigins = [
    "http://localhost:3000",
    "https://chatify-frontend-orpin-ten.vercel.app"
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Store active sockets
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined user room ${userId}`);
    });

    socket.on("join-chat", (chatId) => {
        socket.join(chatId);
        // console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });

    socket.on("send-message", (message) => {
        // console.log("Message received on server:", message);
        io.to(message.chatId).emit("new-message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

app.set("io", io); // Access in routes/controllers

// Routes
app.use("/auth", authRoutes);
app.use("/user", profileRoutes);
app.use("/chat", chatRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(result => {
        console.log("Connected to db");
        server.listen(5000, () => {
            console.log("Server started on port 5000");
        });
    })
    .catch(err => {
        console.log(err);
    });
