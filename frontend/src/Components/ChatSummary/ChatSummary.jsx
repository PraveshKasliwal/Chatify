import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import axios from 'axios';
import './ChatSummary.css';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function ChatSummary({ messages, onClose }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BACKEND}/chat/summarize`, {
        messages
      });

      setSummary(response.data.response);
    } catch (err) {
      setError('Failed to generate summary');
      console.error('Failed to fetch summary:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-overlay" onClick={onClose}>
      <div className="summary-panel slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="summary-header">
          <h2 className="summary-title">Chat Summary</h2>
          <button className="summary-close-btn" onClick={onClose}>
            <MdClose />
          </button>
        </div>

        <div className="summary-content">
          {loading ? (
            <div className="summary-loading">
              <div className="spinner"></div>
              <p>Generating summary...</p>
            </div>
          ) : error ? (
            <div className="summary-error">
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchSummary}>
                Retry
              </button>
            </div>
          ) : (
            <div className="summary-text">
              <p>{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatSummary;
