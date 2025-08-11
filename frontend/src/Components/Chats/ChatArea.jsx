import { useState, useEffect, useRef } from "react";
import { LuSendHorizontal } from "react-icons/lu";
import axios from "axios";
import search from "../../assets/search-icon.png";
import emoji from "../../assets/emoji-icon.png";
import attachment from "../../assets/attachment-icon.png";
import ChatsSummary from "./ChatsSummary";
import "../../index.css";

import { io } from "socket.io-client";
const socket = io(process.env.REACT_APP_BACKEND_URL || "http://localhost:5000");

const ChatArea = ({
    openProfile,
    chats,
    setChats,
    handleSummarize,
    loading,
    selectedMessages,
    setSelectedMessages
}) => {
    const userId = localStorage.getItem("userId");
    const [message, setMessage] = useState("");
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const isSelecting = selectedMessages.length > 0;

    useEffect(() => {
        setSelectedMessages([]);
    }, [openProfile]);

    const toggleSelectMessage = (msg) => {
        if (msg.type === "image") return;
        const isSelected = selectedMessages.some(
            (selected) => selected._id === msg._id
        );
        if (isSelected) {
            setSelectedMessages((prev) =>
                prev.filter((selected) => selected._id !== msg._id)
            );
        } else {
            setSelectedMessages((prev) => [...prev, msg]);
        }
    };

    const clearSelection = () => setSelectedMessages([]);

    // const [senderUsername, setSenderUsername] = useState(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

    useEffect(() => {
        if (openProfile?.chatId) {
            socket.emit("join-chat", openProfile.chatId);
        }

        const handleNewMessage = (msg) => {
            if (msg.chatId === openProfile.chatId) {
                setChats(prev => ({
                    ...prev,
                    [msg.chatId]: [...(prev[msg.chatId] || []), {
                        text: msg.text,
                        senderId: msg.senderId,
                        senderUsername: msg.senderUsername,
                        type: msg.type || "text"
                    }]
                }));
            }
        };

        socket.on("new-message", handleNewMessage);

        return () => {
            socket.off("new-message", handleNewMessage);
        };
    }, [openProfile]);

    const fetchMessages = async (chatId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat/get-messages/${chatId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
            const data = await response.json();
            // console.log(JSON.stringify(data));
            // console.log(data.text);
            setChats((prev) => ({
                ...prev,
                [openProfile.chatId]: data.map((msg) => ({
                    _id: msg._id,
                    text: msg.text,
                    senderId: msg.senderId,
                    senderUsername: msg.senderUsername,
                    type: msg.type || "text",
                    // createdAt: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    createdAt: msg.createdAt
                }))
            }));
            // console.log(chats);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    useEffect(() => {
        if (openProfile?.chatId) {
            fetchMessages(openProfile.chatId);
        }
    }, [openProfile]);

    const handleSend = async () => {
        if (!message.trim()) return;

        const msgObj = {
            text: message,
            senderId: userId,
            chatId: openProfile.chatId,
        };

        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/chat/send-message`, msgObj);

            // socket is sending message from backend
            socket.emit("send-message", res.data);

            setMessage(""); // Clear message input
        } catch (err) {
            console.error("Send error:", err);
        }
    };

    const handleImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("chatId", openProfile.chatId);
            formData.append("senderId", userId);

            const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/chat/upload-image`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            socket.emit("send-message", res.data); // Broadcast new image
        } catch (err) {
            console.error("S3 image upload error:", err);
        }
    };

    const handleDeleteMessages = async () => {
        if (selectedMessages.length === 0) return;

        try {
            const messageIds = selectedMessages.map(m => m._id);
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/chat/delete-messages/${openProfile.chatId}`, {
                data: { messageIds }
            });

            setSelectedMessages([]); // Clear selection
        } catch (err) {
            console.error("Error deleting messages:", err);
        }
    };

    useEffect(() => {
        socket.on("message-deleted", ({ chatId, messageIds }) => {
            setChats(prev => ({
                ...prev,
                [chatId]: prev[chatId]?.filter(msg => !messageIds.includes(msg._id))
            }));
        });

        return () => {
            socket.off("message-deleted");
        };
    }, []);


    return (
        <div className="chat-bg">
            {/* Chat Header */}
            {isSelecting ? (
                <div className="selection-bar">
                    <span>{selectedMessages.length} selected</span>
                    <div className="selection-buttons">
                        <button className="selection-cancel-button" onClick={handleSummarize} disabled={loading}>
                            {loading ? 'Summarizing...' : 'Summarize Messages'}
                        </button>
                        <button
                            className="selection-cancel-button"
                            onClick={handleDeleteMessages}
                        >
                            Delete
                        </button>
                        <button className="selection-cancel-button" onClick={clearSelection}>Cancel</button>
                    </div>
                    {/* Add more buttons like Delete or Copy */}
                </div>
            ) : (
                <div className='chat-top'>
                    <div className='openchat-profile-image-container'>
                        <img src={openProfile.profileImage} alt="" className='openchat-profile-image' />
                    </div>
                    <div className='openchat-desc-container'>
                        <div className='openchat-desc'>
                            <p className='openchat-name'>{openProfile.username}</p>
                            {/* <p className='openchat-status'>Online</p> */}
                        </div>
                        <div className='openchat-search-div'>
                            <img src={search} alt="" className='openchat-search' />
                        </div>
                    </div>
                </div>
            )}
            {/* {summary && <ChatsSummary summary={summary} onClose={() => setSummary('')} />} */}

            {/* Chat Messages */}
            <div className='chat-area'>
                <div className="chat-messages">
                    {chats[openProfile.chatId]?.map((msg, index) => {
                        const previousMsg = chats[openProfile.chatId][index - 1];
                        const isSameSenderAsPrevious = previousMsg?.senderId === msg.senderId;
                        // console.log("msg1: ", msg);
                        return (
                            <div
                                key={index}
                                className={`message-outer-container ${selectedMessages.some((m) => m._id === msg._id) ? "selected-message" : ""}`}
                                onClick={() => toggleSelectMessage(msg)}
                            >
                                <div
                                    className={`message ${msg.senderId === userId ? "sent" : "received"} ${isSameSenderAsPrevious ? "same-sender" : "new-sender"}`}
                                >
                                    {msg.type === "text" ? (
                                        <div className="message-content">
                                            {(!isSameSenderAsPrevious && msg.senderId !== userId) && (
                                                <div className="message-sender-username">{msg.senderUsername}</div>
                                            )}
                                            <div>{msg.text}</div>
                                        </div>
                                    ) : (
                                        <img src={msg.text} alt="Uploaded" className="uploaded-image" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef}></div>
                </div>
            </div>

            {/* Chat Input */}
            <div className='chat-bottom'>
                <div className='emoji-icon emoji-attachment'>
                    <img src={emoji} alt="" />
                </div>
                <div className='attachment-icon emoji-attachment' onClick={() => fileInputRef.current.click()}>
                    <img src={attachment} alt="Upload File" />
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                handleImageUpload(file);
                            }
                        }}
                    />
                </div>
                <div className='message-area-div'>
                    <input
                        type="text"
                        placeholder='Type a message'
                        className='message-area'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <div className='send-icon-container' onClick={handleSend}>
                    <LuSendHorizontal color="white" className='send-icon' />
                </div>
            </div>
        </div>
    );
};

export default ChatArea;