import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const countries = [
  { code: '+91', name: 'India', digits: 10 },
  { code: '+1', name: 'US', digits: 10 },
  { code: '+44', name: 'UK', digits: 10 },
  { code: '+55', name: 'Brazil', digits: 11 },
  { code: '+49', name: 'Germany', digits: 10 }
];

function Login() {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidPhone = phone.length === selectedCountry.digits;

  const handleSendOTP = async () => {
    if (!isValidPhone) return;

    setLoading(true);
    setError('');

    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
      const response = await axios.post(`${BACKEND}/auth/send-otp`, {
        phone: fullPhone
      });

      if (response.data.success) {
        localStorage.setItem('tempPhone', fullPhone);
        navigate('/otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= selectedCountry.digits) {
      setPhone(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isValidPhone) {
      handleSendOTP();
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card scale-in">
        <div className="login-header">
          <img src="/logo.png" alt="Chatify" className="login-icon" />
          <h1 className="login-title">Chatify</h1>
          <p className="login-subtitle">Enter your phone number to get started</p>
        </div>

        <div className="login-form">
          <div className="country-select-wrapper">
            <select
              className="country-select"
              value={selectedCountry.code}
              onChange={(e) => {
                const country = countries.find(c => c.code === e.target.value);
                setSelectedCountry(country);
                setPhone('');
              }}
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
          </div>

          <div className="phone-input-wrapper">
            <span className="country-code">{selectedCountry.code}</span>
            <input
              type="tel"
              className="phone-input"
              placeholder={`Enter ${selectedCountry.digits}-digit phone number`}
              value={phone}
              onChange={handlePhoneChange}
              onKeyPress={handleKeyPress}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="send-otp-btn"
            onClick={handleSendOTP}
            disabled={!isValidPhone || loading}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
