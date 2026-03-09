import { useState } from 'react';
import Sidebar from './Sidebar/Sidebar';
import ChatArea from './ChatArea/ChatArea';
import NewChatModal from './NewChatModal/NewChatModal';
import ChatSummary from './ChatSummary/ChatSummary';
import './MainView.css';

function MainView() {
  const [activeChat, setActiveChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [refreshChats, setRefreshChats] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryMessages, setSummaryMessages] = useState([]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleChatCreated = (newChat) => {
    setActiveChat(newChat);
  };

  const handleShowSummary = (messages) => {
    setSummaryMessages(messages);
    setShowSummary(true);
  };

  return (
    <div className="main-view">
      <Sidebar
        onSelectChat={setActiveChat}
        activeChat={activeChat}
        onNewChat={() => setShowNewChatModal(true)}
        refreshTrigger={refreshChats}
      />
      <ChatArea
        chat={activeChat}
        onShowSummary={handleShowSummary}
      />

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={(newChat) => {
            setActiveChat(newChat);
            setShowNewChatModal(false);
            setRefreshChats(prev => prev + 1); // trigger sidebar refresh
          }}
        />
      )}

      {showSummary && (
        <ChatSummary
          messages={summaryMessages}
          onClose={() => setShowSummary(false)}
        />
      )}
    </div>
  );
}

export default MainView;
