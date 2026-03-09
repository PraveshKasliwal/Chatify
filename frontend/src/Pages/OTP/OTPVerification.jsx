import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import axios from 'axios';
import './OTPVerification.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function OTPVerification() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const tempPhone = localStorage.getItem('tempPhone');
    if (!tempPhone) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    if (pastedData.length === 6) {
      inputRefs.current[5].focus();
    } else {
      inputRefs.current[pastedData.length].focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      // Must send full phone with country code — e.g. +919876543210
      // because OTP was saved with full phone in sentOtp
      const phone = localStorage.getItem('tempPhone');
      console.log('Verifying with phone:', phone, 'otp:', otpCode); // debug

      const response = await axios.post(`${BACKEND}/auth/verify-otp`, {
        phone,
        otp: otpCode
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // For new user, user object may be null — handle that
        if (response.data.user) {
          localStorage.setItem('userId', response.data.user._id);
          localStorage.setItem('username', response.data.user.username || '');
        }

        if (response.data.isNewUser) {
          navigate('/profile');
        } else {
          navigate('/main');
          localStorage.removeItem('tempPhone');
        }
      }
    } catch (err) {
      console.error('Verify error:', err.response?.data);
      setError(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="otp-container fade-in">
      <div className="otp-card scale-in">
        <div className="otp-header">
          <img src="/logo.png" alt="Chatify" className="otp-icon" />
          <h1 className="otp-title">Verify OTP</h1>
          <p className="otp-subtitle">Enter the 6-digit code sent to your phone</p>
        </div>

        <div className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="verify-btn"
            onClick={handleVerify}
            disabled={!isOtpComplete || loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;
