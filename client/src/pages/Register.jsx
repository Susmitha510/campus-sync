import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    year: '',
    branch: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async () => {
    if (!form.name.trim())     { setError('Please enter your full name'); return; }
    if (!form.email.trim())    { setError('Please enter your email'); return; }
    if (!form.password.trim()) { setError('Please enter a password'); return; }
    if (!form.year.trim())     { setError('Please enter your year'); return; }
    if (!form.branch.trim())   { setError('Please enter your branch'); return; }
    if (!form.skills.trim())   { setError('Please enter at least one skill'); return; }

    setError('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      setSuccess('Registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setSuccess('');
      setError('Registration failed. Email may already exist.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
  };

  return (
    <div className="register-container">
      <div className="register-box">

        <div className="register-logo">CS</div>
        <h2 className="register-title">CampusSync</h2>
        <p className="register-subtitle">Create your account</p>

        {error && (
          <div className="register-error-banner">⚠️ {error}</div>
        )}
        {success && (
          <div className="register-success-banner">✓ {success}</div>
        )}

        <div className="register-field">
          <label className="register-label">Full Name</label>
          <input
            className="register-input"
            type="text"
            name="name"
            placeholder="e.g. Susmitha P"
            value={form.name}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="register-field">
          <label className="register-label">Email Address</label>
          <input
            className="register-input"
            type="email"
            name="email"
            placeholder="e.g. you@college.edu"
            value={form.email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="register-field">
          <label className="register-label">Password</label>
          <div className="register-input-wrapper">
            <input
              className="register-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <span className="register-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        </div>

        <div className="register-grid">
          <div className="register-field">
            <label className="register-label">Year</label>
            <input
              className="register-input"
              type="text"
              name="year"
              placeholder="e.g. 3rd year"
              value={form.year}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="register-field">
            <label className="register-label">Branch</label>
            <input
              className="register-input"
              type="text"
              name="branch"
              placeholder="e.g. CSE"
              value={form.branch}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="register-field">
          <label className="register-label">Skills</label>
          <input
            className="register-input"
            type="text"
            name="skills"
            placeholder="e.g. React, Node, MongoDB"
            value={form.skills}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <span className="register-hint">Separate skills with commas</span>
        </div>

        <button className="register-button" onClick={handleRegister}>
          Register
        </button>

        <p className="register-link">
          Already have an account? <Link to="/" className="register-link-anchor">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;