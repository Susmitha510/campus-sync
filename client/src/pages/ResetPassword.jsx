import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResetPassword.css';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!password.trim()) { setError('Please enter a new password'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!confirm.trim()) { setError('Please confirm your password'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('https://campus-sync-production.up.railway.app/api/password/reset/' + token, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleReset();
  };

  return (
    <div className="reset-container">
      <div className="reset-box">

        <div className="reset-logo">CS</div>
        <h2 className="reset-title">CampusSync</h2>
        <p className="reset-subtitle">Enter your new password below</p>

        {message && (
          <div className="reset-success-banner">
            <span>✓</span> {message} Redirecting to login...
          </div>
        )}
        {error && (
          <div className="reset-error-banner">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="reset-field">
          <label className="reset-label">New Password</label>
          <div className="reset-input-wrapper">
            <input
              className="reset-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
            <span className="reset-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        <div className="reset-field">
          <label className="reset-label">Confirm New Password</label>
          <div className="reset-input-wrapper">
            <input
              className="reset-input"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
            <span className="reset-toggle" onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        <button
          className="reset-button"
          onClick={handleReset}
          disabled={loading}
        >
          {loading ? '🔒 Resetting...' : 'Reset Password'}
        </button>

        <p className="reset-link">
          Remember your password? <Link to="/" className="reset-link-anchor">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default ResetPassword;