import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password.trim()) { setError('Please enter your password'); return; }
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/board');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="login-logo">CS</div>
        <h2 className="login-title">CampusSync</h2>
        <p className="login-subtitle">Login to your account</p>

        {error && (
          <div className="login-error-banner">
            ⚠️ {error}
          </div>
        )}

        <div className="login-field">
          <label className="login-label">Email Address</label>
          <input
            className="login-input"
            type="email"
            placeholder="e.g. you@college.edu"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="login-field">
          <label className="login-label">Password</label>
          <div className="login-input-wrapper">
            <input
              className="login-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
            <span className="login-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        <div className="login-forgot-row">
          <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
        </div>

        <button className="login-button" onClick={handleLogin}>Login</button>

        <p className="login-link">
          Don't have an account? <Link to="/register" className="login-link-anchor">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;