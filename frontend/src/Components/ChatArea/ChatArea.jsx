import { useState, useEffect, useRef } from 'react';
import { IoSearchOutline, IoSendSharp } from 'react-icons/io5';
import { FaRegSmile } from 'react-icons/fa';
import { MdAttachFile, MdClose } from 'react-icons/md';
import { BsTrash } from 'react-icons/bs';
import { AiOutlineFileText } from 'react-icons/ai';
import axios from 'axios';
import io from 'socket.io-client';
import './ChatArea.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const socket = io(BACKEND);

function ChatArea({ chat, onShowSummary }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    socket.emit('join', userId);

    socket.on('new-message', (message) => {
      if (message.chatId === chat?._id) {
        setMessages(prev => [...prev, message]);
      }
    });

    socket.on('message-deleted', ({ chatId, messageIds }) => {
      if (chatId === chat?._id) {
        setMessages(prev => prev.filter(msg => !messageIds.includes(msg._id)));
      }
    });

    return () => {
      socket.off('new-message');
      socket.off('message-deleted');
    };
  }, [userId, chat]);

  useEffect(() => {
    if (chat) {
      fetchMessages();
      findOtherUser();
      socket.emit('join-chat', chat._id);
      setIsSelecting(false);
      setSelectedMessages([]);
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${BACKEND}/chat/get-messages/${chat._id}`);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const findOtherUser = () => {
    if (chat.type === 'group') {
      // For groups, set a fake "user" object using group name and group photo
      setOtherUser({
        username: chat.groupName || 'Group Chat',
        profileImage: chat.profileImage || null,
      });
    } else {
      // For DM, find the other person
      const other = chat.members?.find(
        m => m._id?.toString() !== userId && m._id !== userId
      );
      setOtherUser(other);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await axios.post(`${BACKEND}/chat/send-message`, {
        text: inputText.trim(),
        senderId: userId,
        chatId: chat._id
      });
      // Sender adds their own message directly — socket only goes to others
      setMessages(prev => [...prev, response.data]);
      setInputText('');
      socket.emit('send-message', response.data);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('chatId', chat._id);
      formData.append('senderId', userId);

      const response = await axios.post(`${BACKEND}/chat/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      socket.emit('send-message', response.data);
    } catch (err) {
      console.error('Failed to upload image:', err);
    }
  };

  const toggleMessageSelection = (messageId) => {
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedMessages([messageId]);
    } else {
      setSelectedMessages(prev =>
        prev.includes(messageId)
          ? prev.filter(id => id !== messageId)
          : [...prev, messageId]
      );
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;

    try {
      await axios.delete(`${BACKEND}/chat/delete-messages/${chat._id}`, {
        data: { messageIds: selectedMessages }
      });

      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg._id)));
      setIsSelecting(false);
      setSelectedMessages([]);
    } catch (err) {
      console.error('Failed to delete messages:', err);
    }
  };

  const handleSummarize = async () => {
    if (selectedMessages.length === 0) return;

    const selectedMsgs = messages.filter(msg => selectedMessages.includes(msg._id));
    onShowSummary(selectedMsgs);
    setIsSelecting(false);
    setSelectedMessages([]);
  };

  const cancelSelection = () => {
    setIsSelecting(false);
    setSelectedMessages([]);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!chat) {
    return (
      <div className="chat-area-empty">
        <div className="empty-state">
          <IoSearchOutline className="empty-state-icon" />
          <h2>Select a chat to start messaging</h2>
          <p>Choose a conversation from the sidebar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-user">
          {otherUser?.profileImage ? (
            <img src={otherUser.profileImage} alt={otherUser.username} className="header-avatar" />
          ) : (
            <div className="header-avatar-placeholder">
              {otherUser?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="header-info">
            <h3 className="header-name">{otherUser?.username || 'Unknown'}</h3>
            <span className="online-status">
              <span className="online-dot"></span>
              Online
            </span>
          </div>
        </div>
        <button className="header-search-btn">
          <IoSearchOutline />
        </button>
      </div>

      {isSelecting && (
        <div className="selection-bar">
          <span className="selection-count">{selectedMessages.length} selected</span>
          <div className="selection-actions">
            <button className="selection-btn" onClick={handleSummarize}>
              <AiOutlineFileText /> Summarize
            </button>
            <button className="selection-btn delete" onClick={handleDeleteMessages}>
              <BsTrash /> Delete
            </button>
            <button className="selection-btn" onClick={cancelSelection}>
              <MdClose /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.map((message, index) => {
          const isSent = message.senderId === userId;
          const showSender = index === 0 || messages[index - 1].senderId !== message.senderId;
          const isSelected = selectedMessages.includes(message._id);

          return (
            <div
              key={message._id}
              className={`message-wrapper ${isSent ? 'sent' : 'received'}`}
              onClick={() => toggleMessageSelection(message._id)}
            >
              {!isSent && showSender && (
                <span className="message-sender">{message.senderUsername}</span>
              )}
              <div className={`message-bubble ${isSelected ? 'selected' : ''}`}>
                {message.type === 'image' ? (
                  <img src={message.text} alt="Shared" className="message-image" />
                ) : (
                  <p className="message-text">{message.text}</p>
                )}
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <button className="input-icon-btn">
          <FaRegSmile />
        </button>
        <button className="input-icon-btn" onClick={() => fileInputRef.current.click()}>
          <MdAttachFile />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </button>
        <input
          type="text"
          className="message-input"
          placeholder="Message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <IoSendSharp />
        </button>
      </div>
    </div>
  );
}

export default ChatArea;
