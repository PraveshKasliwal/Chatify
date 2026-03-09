import { useState, useRef } from 'react';
import { MdClose } from 'react-icons/md';
import { IoSearchOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './NewChatModal.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function NewChatModal({ onClose, onChatCreated }) {
  const [step, setStep] = useState('select'); // 'select' | 'groupInfo'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Group info fields
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState('');
  const [groupImagePreview, setGroupImagePreview] = useState('');

  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('userId');

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim() || query.replace(/\D/g, '').length < 5) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const cleanPhone = query.replace(/^\+?91/, '').replace(/\D/g, '');
      const response = await axios.get(`${BACKEND}/chat/users`, {
        params: { phone: cleanPhone }
      });
      const user = response.data;
      if (user && user._id && user._id.toString() !== userId) {
        setSearchResults([user]);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u._id === user._id);
      return exists ? prev.filter(u => u._id !== user._id) : [...prev, user];
    });
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== userId));
  };

  // Called when clicking "Next" — if 1 user = DM, if 2+ = group info step
  const handleNext = () => {
    if (selectedUsers.length === 0) return;
    if (selectedUsers.length === 1) {
      // DM — create directly
      handleCreateChat();
    } else {
      // Group — go to group info step
      setStep('groupInfo');
    }
  };

  const handleGroupImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setGroupImage(reader.result);
      setGroupImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateChat = async () => {
    setLoading(true);
    try {
      const isGroup = selectedUsers.length > 1;
      const body = {
        memberIds: selectedUsers.map(u => u._id),
        creatorId: userId,
        ...(isGroup && { groupName: groupName.trim() || 'Group Chat' }),
        ...(isGroup && groupImage && { profileImage: groupImage }),
      };

      const response = await axios.post(`${BACKEND}/chat/create`, body);
      onChatCreated(response.data.chat);
      onClose();
    } catch (err) {
      console.error('Failed to create chat:', err);
      alert(err.response?.data?.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content scale-in" onClick={(e) => e.stopPropagation()}>

        {/* ── STEP 1: Select users ── */}
        {step === 'select' && (
          <>
            <div className="modal-header">
              <h2 className="modal-title">New Chat</h2>
              <button className="modal-close-btn" onClick={onClose}><MdClose /></button>
            </div>

            <div className="modal-search">
              <IoSearchOutline className="modal-search-icon" />
              <input
                type="text"
                placeholder="Search by phone number..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="modal-search-input"
                autoFocus
              />
            </div>

            {/* Show selected users as chips */}
            {selectedUsers.length > 0 && (
              <div className="selected-chips">
                {selectedUsers.map(user => (
                  <div key={user._id} className="chip">
                    <span>{user.username}</span>
                    <button className="chip-remove" onClick={() => removeSelectedUser(user._id)}>
                      <MdClose />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-body">
              {searching ? (
                <div className="modal-loading">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="user-list">
                  {searchResults.map(user => {
                    const selected = selectedUsers.some(u => u._id === user._id);
                    return (
                      <div
                        key={user._id}
                        className={`user-item ${selected ? 'selected' : ''}`}
                        onClick={() => toggleUserSelection(user)}
                      >
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.username} className="user-avatar" />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="user-info">
                          <span className="user-name">{user.username}</span>
                          <span className="user-phone">{user.number}</span>
                        </div>
                        {selected && <IoCheckmarkCircle className="check-icon" />}
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery.trim() ? (
                <div className="modal-empty">No user found</div>
              ) : (
                <div className="modal-empty">Enter a phone number to search</div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="modal-footer">
                <div className="selected-count">
                  {selectedUsers.length} user(s) selected
                  {selectedUsers.length > 1 && <span className="group-hint"> · Will create a group</span>}
                </div>
                <button className="start-chat-btn" onClick={handleNext}>
                  {selectedUsers.length === 1 ? 'Start Chat' : 'Next →'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STEP 2: Group info ── */}
        {step === 'groupInfo' && (
          <>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={() => setStep('select')}>←</button>
              <h2 className="modal-title">Group Info</h2>
              <button className="modal-close-btn" onClick={onClose}><MdClose /></button>
            </div>

            <div className="group-info-body">
              {/* Group photo */}
              <div className="group-avatar-upload" onClick={() => fileInputRef.current.click()}>
                {groupImagePreview ? (
                  <img src={groupImagePreview} alt="Group" className="group-avatar-preview" />
                ) : (
                  <div className="group-avatar-placeholder">
                    <FaCamera />
                    <span>Add Photo</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleGroupImageChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Group name */}
              <input
                type="text"
                className="group-name-input"
                placeholder="Group name (required)"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                autoFocus
              />

              {/* Members preview */}
              <div className="group-members-preview">
                <p className="members-label">Members ({selectedUsers.length + 1})</p>
                <div className="members-list">
                  <div className="member-chip">You</div>
                  {selectedUsers.map(u => (
                    <div key={u._id} className="member-chip">{u.username}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="start-chat-btn"
                onClick={handleCreateChat}
                disabled={!groupName.trim() || loading}
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default NewChatModal;