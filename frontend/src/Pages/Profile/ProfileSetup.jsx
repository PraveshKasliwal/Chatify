import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import axios from 'axios';
import './ProfileSetup.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function ProfileSetup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/');
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!username.trim()) { setError('Please enter a username'); return; }
    if (username.length < 3) { setError('Username must be at least 3 characters'); return; }
    setLoading(true); setError('');
    try {
      // Strip +91 from stored phone to match how backend saves number
      const fullPhone = localStorage.getItem('tempPhone') || '';
      const number = fullPhone.replace(/^\+?91/, '').replace(/\D/g, '');

      const response = await axios.post(`${BACKEND}/user/save-profile`, {
        number,
        name: username.trim(),
        base64Image: profileImage || ''
      });

      // Now save userId from the response
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('username', username.trim());
      navigate('/main');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && username.trim().length >= 3) {
      handleSubmit();
    }
  };

  return (
    <div className="profile-container fade-in">
      <div className="profile-card scale-in">
        <div className="profile-header">
          <h1 className="profile-title">Setup Your Profile</h1>
          <p className="profile-subtitle">Choose a profile picture and username</p>
        </div>

        <div className="profile-form">
          <div className="avatar-upload">
            <div
              className="avatar-preview"
              onClick={() => fileInputRef.current.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <FaCamera className="camera-icon" />
                  <span className="avatar-text">Upload Photo</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="avatar-input"
            />
          </div>

          <div className="username-input-wrapper">
            <input
              type="text"
              className="username-input"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={30}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="continue-btn"
            onClick={handleSubmit}
            disabled={!username.trim() || username.length < 3 || loading}
          >
            {loading ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
