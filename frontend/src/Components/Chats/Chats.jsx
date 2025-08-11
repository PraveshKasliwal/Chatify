import { useEffect, useState } from 'react';
import ChatDetail from '../commons/ChatDetail';
import '../../index.css';
import ChatsHeader from './ChatsHeader';
import axios from 'axios';
import { io } from "socket.io-client";

import NewChatModal from '../../Pages/AddChat/NewChatModel';

const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

const Chats = ({ openProfile, setOpenProfile }) => {
    const [chats, setChats] = useState([]);
    const userId = localStorage.getItem("userId");
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = chats.filter(chat => {
        const isGroup = chat.type === "group";
        const chatName = isGroup
            ? chat.groupName?.toLowerCase()
            : chat.members.find(m => m._id !== userId)?.username?.toLowerCase();

        return chatName?.includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        if (userId) {
            socket.emit("join", userId); // ✅ Ensures user joins their own room
        }
        console.log('userId:', userId);
        console.log('chats:', chats);

        // Listen for deleted chat
        socket.on("chat-deleted", ({ chatId }) => {
            setChats(prev => prev.filter(chat => chat._id !== chatId));
            console.log(`Chat with ID ${chatId} deleted`);
        });

        // Listen for a new chat
        socket.on("new-chat", (newChat) => {
            const isMember = newChat.members.some(m => m._id === userId);
            if (isMember) {
                setChats(prev => sortChats([...prev, newChat]));
            }
        });

        return () => {
            socket.off("chat-deleted");
            socket.off("new-chat");
        };
    }, [userId]);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/chat/user-chats/${userId}`);
                setChats(sortChats(res.data));
                setOpenProfile(null);
            } catch (err) {
                console.error("Failed to fetch chats:", err);
            }
        };

        fetchChats();
    }, [userId]);

    // Sort chats by the latest message timestamp
    const sortChats = (chats) => {
        return chats.sort((a, b) => {
            const aTime = a.latestMessage?.updatedAt || 0;
            const bTime = b.latestMessage?.updatedAt || 0;
            return bTime - aTime;
        });
    };

    return (
        <div className='chat-tab'>
            {
                showModal ?
                    <NewChatModal closeModal={() => setShowModal(false)} /> :
                    <div>
                        <ChatsHeader openModel={() => setShowModal(true)} onSearch={setSearchQuery} />
                        <div className='all-chats'>
                            {
                                filteredChats.map((chat) => {
                                    const isGroup = chat.type === "group";
                                    const chatName = isGroup
                                        ? chat.groupName
                                        : chat.members.find(m => m._id !== userId)?.username;
                                    const profilePhoto = isGroup
                                        ? chat.profileImage
                                        : chat.members.find(m => m._id !== userId)?.profileImage;
                                    const openProfileObj = {
                                        chatId: chat._id,
                                        username: chatName,
                                        profileImage: profilePhoto,
                                        members: chat.members,
                                        type: chat.type,
                                    };

                                    return (
                                        <ChatDetail
                                            key={chat._id}
                                            id={chat._id}
                                            profilePhoto={profilePhoto}
                                            userName={chatName}
                                            recentMsg={chat.latestMessage?.text || ""}
                                            setOpenProfile={setOpenProfile}
                                            openProfile={openProfile}
                                            userObj={openProfileObj}
                                        />
                                    );
                                })
                            }
                        </div>
                    </div>
            }
        </div>
    );
};

export default Chats;