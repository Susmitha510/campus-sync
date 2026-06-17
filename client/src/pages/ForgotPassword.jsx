import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.post('https://campus-sync-production.up.railway.app/api/password/forgot', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <div className="forgot-logo">CS</div>
        <h2 className="forgot-title">CampusSync</h2>
        <p className="forgot-subtitle">Enter your email to receive a password reset link</p>

        {message && (
          <div className="forgot-success-banner">
            <span className="forgot-success-icon">✓</span> {message}
          </div>
        )}
        {error && (
          <div className="forgot-error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="forgot-field">
          <label className="forgot-label">Email Address</label>
          <input
            className="forgot-input"
            type="email"
            placeholder="e.g. you@college.edu"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="forgot-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '📨 Sending...' : 'Send Reset Link'}
        </button>

        <p className="forgot-link">
          Remember your password? <Link to="/" className="forgot-link-anchor">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;