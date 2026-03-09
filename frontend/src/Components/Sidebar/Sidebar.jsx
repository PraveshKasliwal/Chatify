import { useState, useEffect } from 'react';
import { IoChatbubbleEllipsesOutline, IoAddOutline, IoSearchOutline } from 'react-icons/io5';
import { BiMessageSquareDetail, BiArchive, BiStar, BiCog } from 'react-icons/bi';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Sidebar.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND);

function Sidebar({ onSelectChat, activeChat, onNewChat, refreshTrigger }) {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Read own info directly from localStorage — no API call needed
  const userId = localStorage.getItem('userId');
  const myUsername = localStorage.getItem('username') || 'Me';
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    fetchChats();
  }, [refreshTrigger]);

  useEffect(() => {
    socket.emit('join', userId);

    socket.on('new-chat', (newChat) => {
      setChats(prev => {
        const exists = prev.find(c => c._id === newChat._id);
        if (exists) return prev;
        return [newChat, ...prev];
      });
    });

    socket.on('new-message', (message) => {
      setChats(prev => prev.map(chat => {
        if (chat._id === message.chatId) {
          return {
            ...chat,
            lastMessage: {
              text: message.type === 'image' ? '📷 Image' : message.text,
              type: message.type,
              createdAt: message.createdAt,
              senderId: message.senderId,
              senderUsername: message.senderUsername,
            }
          };
        }
        return chat;
      }));
    });

    socket.on('chat-deleted', ({ chatId }) => {
      setChats(prev => prev.filter(c => c._id !== chatId));
    });

    socket.on('sidebar-update', (message) => {
      setChats(prev => prev.map(chat => {
        if (chat._id === message.chatId) {
          return {
            ...chat,
            lastMessage: {
              text: message.type === 'image' ? '📷 Image' : message.text,
              type: message.type,
              createdAt: message.createdAt,
              senderId: message.senderId,
              senderUsername: message.senderUsername,
            }
          };
        }
        return chat;
      }));
    });

    return () => {
      socket.off('new-chat');
      socket.off('chat-deleted');
      socket.off('new-message');
      socket.off('sidebar-update');
    };
  })

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = chats.filter(chat =>
        getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  const handleMenuToggle = (e, chatId) => {
    e.stopPropagation();
    setOpenMenuId(prev => prev === chatId ? null : chatId);
  };

  const handleRightClick = (e, chatId) => {
    e.preventDefault();
    setOpenMenuId(prev => prev === chatId ? null : chatId);
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await axios.delete(`${BACKEND}/chat/delete-chat/${chatId}/${userId}`);
      setChats(prev => prev.filter(c => c._id !== chatId));
      setFilteredChats(prev => prev.filter(c => c._id !== chatId));
      setOpenMenuId(null);
    } catch (err) {
      console.error('Failed to delete chat:', err);
      alert(err.response?.data?.message || 'Failed to delete chat');
    }
  };

  // Close menu when clicking anywhere else
  useEffect(() => {
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${BACKEND}/chat/user-chats/${userId}`);
      setChats(response.data);
      setFilteredChats(response.data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  // Get the other person in a DM (not current user)
  const getOtherMember = (chat) => {
    return chat.members?.find(
      m => m._id?.toString() !== userId && m._id !== userId
    );
  };

  // Display name for the chat
  const getChatName = (chat) => {
    if (chat.type === 'group') return chat.groupName || 'Group Chat';
    const other = getOtherMember(chat);
    return other?.username || 'Unknown';
  };

  // Avatar image for the chat
  const getChatImage = (chat) => {
    if (chat.type === 'group') return chat.profileImage || null;
    const other = getOtherMember(chat);
    return other?.profileImage || null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (diff < 604800000) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar-placeholder">
            {myUsername[0]?.toUpperCase() || 'U'}
          </div>
          <span className="sidebar-title">Chatify</span>
        </div>
        <button className="compose-btn" onClick={onNewChat}>
          <IoAddOutline />
        </button>
      </div>

      <div className="sidebar-search">
        <IoSearchOutline className="search-icon" />
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="chat-list">
        {filteredChats.length === 0 ? (
          <div className="empty-chats">
            <IoChatbubbleEllipsesOutline className="empty-icon" />
            <p className="empty-text">No chats yet</p>
            <p className="empty-subtext">Start a new conversation</p>
          </div>
        ) : (
          filteredChats.map(chat => {
            const chatImage = getChatImage(chat);
            const chatName = getChatName(chat);
            const isActive = activeChat?._id === chat._id;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectChat(chat)}
                onContextMenu={(e) => handleRightClick(e, chat._id)}
              >
                {chatImage ? (
                  <img src={chatImage} alt={chatName} className="chat-avatar" />
                ) : (
                  <div className="chat-avatar-placeholder">
                    {chatName[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="chat-info">
                  <div className="chat-header-row">
                    <span className="chat-name">{chatName}</span>
                    {chat.lastMessage && (
                      <span className="chat-time">{formatTime(chat.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <p className="chat-last-message">
                    {chat.lastMessage
                      ? `${chat.lastMessage.senderId?.toString() === userId || chat.lastMessage.senderUsername === myUsername ? 'You' : chat.lastMessage.senderUsername}: ${chat.lastMessage.text}`
                      : 'No messages yet'}
                  </p>
                </div>

                {/* Three dot menu button */}
                <button
                  className="chat-menu-btn"
                  onClick={(e) => { e.stopPropagation(); handleMenuToggle(e, chat._id); }}
                >
                  ⋮
                </button>

                {/* Dropdown menu */}
                {openMenuId === chat._id && (
                  <div className="chat-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="chat-dropdown-item delete"
                      onClick={() => handleDeleteChat(chat._id)}
                    >
                      🗑 Delete Chat
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <button className="footer-btn active"><BiMessageSquareDetail /></button>
        <button className="footer-btn"><BiArchive /></button>
        <button className="footer-btn"><BiStar /></button>
        <button className="footer-btn"><BiCog /></button>
      </div>
    </div>
  );
}

export default Sidebar;