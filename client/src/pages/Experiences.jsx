import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Experiences.css';

const EXP_ALL_KEY  = '__cs_experiences__';
const EXP_MINE_KEY = '__cs_my_experiences__';

function Experiences() {
  const [experiences, setExperiences]       = useState(() => window[EXP_ALL_KEY]  || []);
  const [myExperiences, setMyExperiences]   = useState(() => window[EXP_MINE_KEY] || []);
  const [loading, setLoading]               = useState(!(window[EXP_ALL_KEY] && window[EXP_MINE_KEY]));
  const [activeTab, setActiveTab]           = useState('all');
  const [search, setSearch]                 = useState('');
  const [form, setForm] = useState({
    company: '',
    role: '',
    rounds: '',
    questions: '',
    result: 'selected'
  });
  const [showForm, setShowForm]             = useState(false);
  const [errorMsg, setErrorMsg]             = useState('');
  const [editExp, setEditExp]               = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  // ── Read More state (same pattern as Board) ──
  const [expandedPosts, setExpandedPosts]   = useState({});

  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    Promise.all([fetchExperiences(), fetchMyExperiences()])
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExperiences = useCallback(async (company = '') => {
    try {
      const res = await axios.get(`http://localhost:5000/api/experiences?company=${company}`, {
        headers: { Authorization: token }
      });
      window[EXP_ALL_KEY] = res.data;
      setExperiences(res.data);
    } catch (err) { console.log(err); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchMyExperiences = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/experiences/mine', {
        headers: { Authorization: token }
      });
      window[EXP_MINE_KEY] = res.data;
      setMyExperiences(res.data);
    } catch (err) { console.log(err); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchExperiences(e.target.value);
  };

  const handlePost = async () => {
    if (!form.company.trim())   { setErrorMsg('Please enter a company name'); return; }
    if (!form.role.trim())      { setErrorMsg('Please enter a role'); return; }
    if (!form.rounds || isNaN(form.rounds) || Number(form.rounds) < 1) {
      setErrorMsg('Please enter a valid number of rounds'); return;
    }
    if (!form.questions.trim()) { setErrorMsg('Please describe the interview questions and process'); return; }

    setErrorMsg('');
    try {
      await axios.post('http://localhost:5000/api/experiences', form, {
        headers: { Authorization: token }
      });
      setForm({ company: '', role: '', rounds: '', questions: '', result: 'selected' });
      setShowForm(false);
      fetchExperiences(search);
      fetchMyExperiences();
    } catch (err) { console.log(err); }
  };

  const handleUpvote = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/experiences/${id}/upvote`, {}, {
        headers: { Authorization: token }
      });
      fetchExperiences(search);
      fetchMyExperiences();
    } catch (err) { console.log(err); }
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/experiences/${id}`, editExp, {
        headers: { Authorization: token }
      });
      setEditExp(null);
      fetchExperiences(search);
      fetchMyExperiences();
    } catch (err) { console.log(err); }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/experiences/${confirmDeleteId}`, {
        headers: { Authorization: token }
      });
      setConfirmDeleteId(null);
      fetchExperiences(search);
      fetchMyExperiences();
    } catch (err) { console.log(err); }
  };

  // ── Toggle expand for a specific card ──
  const toggleExpand = (id) => {
    setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resultBadgeClass = (result) => {
    if (result === 'selected') return 'exp-result-badge badge-selected';
    if (result === 'rejected') return 'exp-result-badge badge-rejected';
    return 'exp-result-badge badge-waiting';
  };

  const resetForm = () => {
    setForm({ company: '', role: '', rounds: '', questions: '', result: 'selected' });
    setShowForm(false);
    setErrorMsg('');
  };

  const renderEmptyMyExp = () => (
    <div className="exp-empty-state">
      <div className="exp-empty-icon">💼</div>
      <h3 className="exp-empty-title">Share your first interview experience</h3>
      <p className="exp-empty-desc">
        Help your peers prepare better. Share what you faced in interviews — questions, rounds, and tips.
      </p>
      <button
        className="exp-post-button"
        onClick={() => {
          setShowForm(true);
          setErrorMsg('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        + Share Your Experience
      </button>
    </div>
  );

  const renderNoResults = () => (
    <div className="exp-no-results">
      <div className="exp-no-results-icon">🔍</div>
      <h3 className="exp-no-results-title">No results found for "{search}"</h3>
      <p className="exp-no-results-desc">Try a different company name or check your spelling.</p>
    </div>
  );

  const renderExpCard = (exp, isMyPost) => {
    const alreadyUpvoted  = exp.upvotedBy.includes(user.id);
    const isPendingDelete = confirmDeleteId === exp._id;
    const isEditing       = editExp && editExp._id === exp._id;

    const isOwner =
      exp.postedBy._id === user.id ||
      exp.postedBy._id === user._id;

    const postedByText = isOwner
      ? `Posted by You — ${exp.postedBy.branch} ${exp.postedBy.year}`
      : `Posted by ${exp.postedBy.name} — ${exp.postedBy.branch} ${exp.postedBy.year}`;

    return (
      <div key={exp._id} className={`exp-card ${isEditing ? 'editing' : ''}`}>
        {isEditing ? (
          <div className="exp-edit-form">
            <h4 className="exp-edit-title">✏️ Edit Experience</h4>
            <div className="exp-edit-grid">
              <div className="exp-edit-field">
                <label className="exp-edit-label">Company Name</label>
                <input
                  className="exp-edit-input"
                  value={editExp.company}
                  onChange={e => setEditExp({ ...editExp, company: e.target.value })}
                  placeholder="e.g. Google"
                />
              </div>
              <div className="exp-edit-field">
                <label className="exp-edit-label">Role</label>
                <input
                  className="exp-edit-input"
                  value={editExp.role}
                  onChange={e => setEditExp({ ...editExp, role: e.target.value })}
                  placeholder="e.g. Software Engineer Intern"
                />
              </div>
              <div className="exp-edit-field">
                <label className="exp-edit-label">Number of Rounds</label>
                <input
                  className="exp-edit-input"
                  type="number"
                  min="1"
                  value={editExp.rounds}
                  onChange={e => setEditExp({ ...editExp, rounds: e.target.value })}
                />
              </div>
              <div className="exp-edit-field">
                <label className="exp-edit-label">Result</label>
                <select
                  className="exp-edit-input"
                  value={editExp.result}
                  onChange={e => setEditExp({ ...editExp, result: e.target.value })}
                >
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                  <option value="waiting">Waiting</option>
                </select>
              </div>
            </div>
            <div className="exp-edit-field exp-edit-field-mt">
              <label className="exp-edit-label">Interview Questions & Process</label>
              <textarea
                className="exp-edit-textarea"
                value={editExp.questions}
                onChange={e => setEditExp({ ...editExp, questions: e.target.value })}
                placeholder="Describe the interview questions and process"
              />
            </div>
            <div className="exp-edit-actions">
              <button className="exp-post-button"    onClick={() => handleEdit(exp._id)}>Save</button>
              <button className="exp-cancel-button"  onClick={() => setEditExp(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {/* Tags row */}
            <div className="exp-card-tags-row">
              <span className={resultBadgeClass(exp.result)}>
                {exp.result.charAt(0).toUpperCase() + exp.result.slice(1)}
              </span>
            </div>

            {/* Company & Role */}
            <h3 className="exp-company">{exp.company}</h3>
            <p className="exp-role">{exp.role} — {exp.rounds} rounds</p>

            {/* Questions with Read More / Read Less — same as Board */}
            <div className="exp-questions-wrapper">
              <p className={`exp-questions ${expandedPosts[exp._id] ? 'expanded' : ''}`}>
                {exp.questions}
              </p>
              {exp.questions.length > 220 && (
                <button
                  type="button"
                  className="exp-read-more-btn"
                  onClick={() => toggleExpand(exp._id)}
                >
                  {expandedPosts[exp._id] ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="exp-card-footer">
              <p className="exp-posted-by">{postedByText}</p>
              <button
                className={`exp-upvote-button ${alreadyUpvoted ? 'upvoted' : 'not-upvoted'}`}
                onClick={() => handleUpvote(exp._id)}
              >
                👍 {exp.upvotedBy.length}
              </button>
            </div>

            {/* My Post actions */}
            {isMyPost && (
              <div>
                {isPendingDelete && (
                  <div className="exp-delete-confirm-box">
                    <p className="exp-delete-confirm-text">⚠️ Are you sure you want to delete this post?</p>
                    <div className="exp-delete-confirm-actions">
                      <button className="exp-btn-confirm-delete" onClick={handleDeleteConfirm}>Yes, Delete</button>
                      <button className="exp-cancel-button"      onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
                <div className="exp-action-row">
                  <button
                    className="exp-btn-edit"
                    onClick={() => setEditExp({
                      _id:       exp._id,
                      company:   exp.company,
                      role:      exp.role,
                      rounds:    exp.rounds,
                      questions: exp.questions,
                      result:    exp.result
                    })}
                  >
                    ✏️ Edit
                  </button>
                  <button className="exp-btn-delete" onClick={() => setConfirmDeleteId(exp._id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="exp-page">

        <div className="exp-page-header">
          <h2 className="exp-page-title">Interview Experience Wall</h2>
          {!showForm && (
            <button className="exp-post-button" onClick={() => setShowForm(true)}>
              + Share Experience
            </button>
          )}
        </div>

        {showForm && (
          <div className="exp-form-card">
            <div className="exp-top-border" />
            <div className="exp-form-body">
              <h3 className="exp-form-title">Share Your Experience</h3>
              <div className="exp-form-grid">
                <div className="exp-field-group">
                  <label className="exp-label">Company Name</label>
                  <input
                    className="exp-input"
                    placeholder="e.g. Google"
                    value={form.company}
                    onChange={e => { setForm({ ...form, company: e.target.value }); setErrorMsg(''); }}
                  />
                </div>
                <div className="exp-field-group">
                  <label className="exp-label">Role</label>
                  <input
                    className="exp-input"
                    placeholder="e.g. Software Engineer Intern"
                    value={form.role}
                    onChange={e => { setForm({ ...form, role: e.target.value }); setErrorMsg(''); }}
                  />
                </div>
              </div>
              <div className="exp-form-grid exp-form-grid-mt">
                <div className="exp-field-group">
                  <label className="exp-label">Number of Rounds</label>
                  <input
                    className="exp-input"
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={form.rounds}
                    onChange={e => { setForm({ ...form, rounds: e.target.value }); setErrorMsg(''); }}
                  />
                </div>
                <div className="exp-field-group">
                  <label className="exp-label">Result</label>
                  <select
                    className="exp-input"
                    value={form.result}
                    onChange={e => { setForm({ ...form, result: e.target.value }); setErrorMsg(''); }}
                  >
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                    <option value="waiting">Waiting</option>
                  </select>
                </div>
              </div>
              <div className="exp-field-group exp-field-group-mt">
                <label className="exp-label">Interview Questions & Process</label>
                <textarea
                  className="exp-textarea"
                  placeholder="Describe the interview questions and process"
                  value={form.questions}
                  onChange={e => { setForm({ ...form, questions: e.target.value }); setErrorMsg(''); }}
                />
              </div>
              {errorMsg && <div className="exp-error-banner">⚠️ {errorMsg}</div>}
              <div className="exp-form-footer">
                <button className="exp-cancel-button" onClick={resetForm}>Cancel</button>
                <button className="exp-post-button"   onClick={handlePost}>Post</button>
              </div>
            </div>
          </div>
        )}

        <div className="exp-tabs">
          <button
            className={`exp-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Posts
          </button>
          <button
            className={`exp-tab ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            My Posts
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="exp-search-wrapper">
            <span className="exp-search-icon">🔍</span>
            <input
              className="exp-search-input"
              placeholder="Search by company name..."
              value={search}
              onChange={handleSearch}
            />
          </div>
        )}

        {activeTab === 'all' ? (
          loading ? (
            <div className="exp-empty-state">
              <div className="exp-empty-icon">⏳</div>
              <h3 className="exp-empty-title">Loading experiences…</h3>
            </div>
          ) : experiences.length === 0 && search.trim() !== '' ? (
            renderNoResults()
          ) : experiences.length === 0 ? (
            <div className="exp-empty-state">
              <div className="exp-empty-icon">📋</div>
              <h3 className="exp-empty-title">No experiences shared yet</h3>
              <p className="exp-empty-desc">Be the first to share your interview experience!</p>
            </div>
          ) : (
            <div className="exp-grid">
              {experiences.map(exp => renderExpCard(exp, false))}
            </div>
          )
        ) : (
          loading ? (
            <div className="exp-empty-state">
              <div className="exp-empty-icon">⏳</div>
              <h3 className="exp-empty-title">Loading your posts…</h3>
            </div>
          ) : myExperiences.length === 0 ? (
            renderEmptyMyExp()
          ) : (
            <div className="exp-grid">
              {myExperiences.map(exp => renderExpCard(exp, true))}
            </div>
          )
        )}

      </div>
    </div>
  );
}

export default Experiences;