import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Profile.css';

const PROFILE_KEY = '__cs_profile__';

function Profile() {
  const cached = window[PROFILE_KEY] || null;
  const [profile, setProfile] = useState(cached);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(
    cached
      ? { name: cached.name, year: cached.year, branch: cached.branch, skills: cached.skills.join(', ') }
      : { name: '', year: '', branch: '', skills: '' }
  );
  const [errorMsg, setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get('https://campus-sync-production.up.railway.app/api/profile', {
        headers: { Authorization: token }
      });
      window[PROFILE_KEY] = res.data;
      setProfile(res.data);
      setForm({
        name:   res.data.name,
        year:   res.data.year,
        branch: res.data.branch,
        skills: res.data.skills.join(', ')
      });
    } catch (err) {
      console.log(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUpdate = async () => {
    if (!form.name.trim())   { setErrorMsg('Please enter your name'); return; }
    if (!form.year.trim())   { setErrorMsg('Please enter your year'); return; }
    if (!form.branch.trim()) { setErrorMsg('Please enter your branch'); return; }
    if (!form.skills.trim()) { setErrorMsg('Please enter at least one skill'); return; }

    setErrorMsg('');
    try {
      await axios.put('https://campus-sync-production.up.railway.app/api/profile', {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
      }, {
        headers: { Authorization: token }
      });
      setEdit(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchProfile();
    } catch (err) {
      setErrorMsg('Failed to update profile. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEdit(false);
    setErrorMsg('');
    // Reset form to current profile values
    if (profile) {
      setForm({
        name: profile.name,
        year: profile.year,
        branch: profile.branch,
        skills: profile.skills.join(', ')
      });
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div>
      <Navbar />
      <div className="profile-container">
        <div className="profile-box">

          {/* Success Banner */}
          {successMsg && (
            <div className="profile-success-banner">✓ {successMsg}</div>
          )}

          {profile && (
            <>
              {edit ? (
                <>
                  <h2 className="profile-title">Edit Profile</h2>

                  {errorMsg && (
                    <div className="profile-error-banner">⚠️ {errorMsg}</div>
                  )}

                  <div className="profile-field">
                    <label className="profile-label">Name</label>
                    <input
                      className="profile-input"
                      value={form.name}
                      onChange={e => { setForm({ ...form, name: e.target.value }); setErrorMsg(''); }}
                      placeholder="e.g. Susmitha P"
                    />
                  </div>
                  <div className="profile-field">
                    <label className="profile-label">Year</label>
                    <input
                      className="profile-input"
                      value={form.year}
                      onChange={e => { setForm({ ...form, year: e.target.value }); setErrorMsg(''); }}
                      placeholder="e.g. 4th year"
                    />
                  </div>
                  <div className="profile-field">
                    <label className="profile-label">Branch</label>
                    <input
                      className="profile-input"
                      value={form.branch}
                      onChange={e => { setForm({ ...form, branch: e.target.value }); setErrorMsg(''); }}
                      placeholder="e.g. CSE"
                    />
                  </div>
                  <div className="profile-field">
                    <label className="profile-label">Skills</label>
                    <input
                      className="profile-input"
                      value={form.skills}
                      onChange={e => { setForm({ ...form, skills: e.target.value }); setErrorMsg(''); }}
                      placeholder="e.g. React, Node, MongoDB"
                    />
                    <span className="profile-hint">Separate skills with commas</span>
                  </div>
                  <div className="profile-actions">
                    <button className="profile-button" onClick={handleUpdate}>Save Changes</button>
                    <button className="profile-cancel-button" onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="profile-title">My Profile</h2>

                  {/* Avatar + Name Header */}
                  <div className="profile-avatar-row">
                    <div className="profile-avatar">{getInitials(profile.name)}</div>
                    <div>
                      <p className="profile-avatar-name">{profile.name}</p>
                      <p className="profile-avatar-sub">{profile.branch} · {profile.year}</p>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="profile-info-grid">
                    <div className="profile-info-item">
                      <span className="profile-info-label">Email</span>
                      <span className="profile-info-value">{profile.email}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Year</span>
                      <span className="profile-info-value">{profile.year}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Branch</span>
                      <span className="profile-info-value">{profile.branch}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="profile-skills-section">
                    <span className="profile-info-label">Skills</span>
                    <div className="profile-skills-list">
                      {profile.skills.map((skill, i) => (
                        <span key={i} className="profile-skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <button className="profile-button profile-edit-btn" onClick={() => setEdit(true)}>
                    ✏️ Edit Profile
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;