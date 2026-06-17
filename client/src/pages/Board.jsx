import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Board.css';

const POSTS_KEY    = '__cs_posts__';
const MY_POSTS_KEY = '__cs_my_posts__';

function Board() {
  
  const [posts, setPosts]       = useState(() => window[POSTS_KEY]    || []);
  const [myPosts, setMyPosts]   = useState(() => window[MY_POSTS_KEY] || []);
  const [activeTab, setActiveTab] = useState('all');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'project',
    skillsRequired: '',
    membersRequired: 2
  });
  const [showForm, setShowForm]           = useState(false);
  const [formError, setFormError]         = useState('');
  const [editPost, setEditPost]           = useState(null);
  const [showApplicants, setShowApplicants] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
    fetchMyPosts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: token }
      });
      window[POSTS_KEY] = res.data;
      setPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchMyPosts = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts/myposts', {
        headers: { Authorization: token }
      });
      window[MY_POSTS_KEY] = res.data;
      setMyPosts(res.data);
    } catch (err) {
      console.log(err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCreate = async () => {
    if (!form.title.trim()) { setFormError('Please enter a title'); return; }
    if (!form.description.trim()) { setFormError('Please enter a description'); return; }
    if (!form.skillsRequired.trim()) { setFormError('Please enter required skills'); return; }
    if (!form.membersRequired || form.membersRequired < 1) { setFormError('Please enter number of members required'); return; }
    setFormError('');
    try {
      await axios.post('http://localhost:5000/api/posts', {
        ...form,
        skillsRequired: form.skillsRequired.split(',').map(s => s.trim())
      }, { headers: { Authorization: token } });
      setForm({ title: '', description: '', type: 'project', skillsRequired: '', membersRequired: 2 });
      setShowForm(false);
      fetchPosts();
      fetchMyPosts();
    } catch (err) { console.log(err); }
  };

  const handleApply = async (id) => {
    try {
      await axios.post('http://localhost:5000/api/posts/' + id + '/apply', {}, { headers: { Authorization: token } });
      fetchPosts();
    } catch (err) { alert(err.response?.data?.message || 'Error applying'); }
  };

  const handleApplicantStatus = async (postId, userId, status) => {
    try {
      await axios.put('http://localhost:5000/api/posts/' + postId + '/applicants/' + userId, { status }, { headers: { Authorization: token } });
      fetchMyPosts();
    } catch (err) { console.log(err); }
  };

  const handleClose = async (id) => {
    try {
      await axios.put('http://localhost:5000/api/posts/' + id + '/close', {}, { headers: { Authorization: token } });
      fetchMyPosts();
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  const handleDeleteClick = (id) => { setConfirmDeleteId(id); };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete('http://localhost:5000/api/posts/' + confirmDeleteId, { headers: { Authorization: token } });
      setConfirmDeleteId(null);
      fetchMyPosts();
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  const handleDeleteCancel = () => { setConfirmDeleteId(null); };

  const toggleExpand = (id) => {
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = async (id) => {
    try {
      await axios.put('http://localhost:5000/api/posts/' + id, { ...editPost, skillsRequired: editPost.skillsRequired }, { headers: { Authorization: token } });
      setEditPost(null);
      fetchMyPosts();
      fetchPosts();
    } catch (err) { console.log(err); }
  };

  const renderEmptyMyPosts = () => (
    <div className="empty-state">
      <div className="empty-state-icon">🚀</div>
      <h3 className="empty-state-title">Post your first project or hackathon</h3>
      <p className="empty-state-desc">
        Looking for teammates? Create a post to find people with the right skills and build something great together.
      </p>
      <button
        className="btn-primary"
        onClick={() => {
          setShowForm(true);
          setFormError('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        + Create Your First Post
      </button>
    </div>
  );

  const renderPostCard = (post, isMyPost) => {
    const alreadyApplied = post.applicants.some(a => a.user?._id === user.id || a.user === user.id);
    const acceptedCount  = post.applicants.filter(a => a.status === 'accepted').length;
    const isPendingDelete = confirmDeleteId === post._id;
    const isEditing = editPost && editPost._id === post._id;

    return (
      <div
        key={post._id}
        className={`post-card ${post.status === 'closed' ? 'closed' : 'open'} ${isEditing ? 'editing' : ''}`}
      >
        {/* ── Top badges row ── */}
        <div className="card-top-row">
          <div className="card-badges">
            <span className="badge">{post.type}</span>
            {post.isEdited && <span className="badge-edited">Edited</span>}
            {post.status === 'closed' && <span className="badge-closed">Team Closed</span>}
          </div>
          <span className="members-tag">👥 {acceptedCount}/{post.membersRequired} members</span>
        </div>

        {/* ── Inline edit form ── */}
        {isEditing ? (
          <div className="edit-form">
            <div className="edit-form-group">
              <label className="edit-form-label">Title</label>
              <input value={editPost.title} onChange={e => setEditPost({ ...editPost, title: e.target.value })} placeholder="Enter title" />
            </div>
            <div className="edit-form-group">
              <label className="edit-form-label">Description</label>
              <textarea value={editPost.description} onChange={e => setEditPost({ ...editPost, description: e.target.value })} placeholder="Describe your project or hackathon" />
            </div>
            <div className="edit-form-group">
              <label className="edit-form-label">Type</label>
              <select value={editPost.type} onChange={e => setEditPost({ ...editPost, type: e.target.value })}>
                <option value="project">Project</option>
                <option value="hackathon">Hackathon</option>
              </select>
            </div>
            <div className="edit-form-group skills-group">
              <label className="edit-form-label">Skills Required</label>
              <input value={editPost.skillsRequired.join(', ')} onChange={e => setEditPost({ ...editPost, skillsRequired: e.target.value.split(',').map(s => s.trim()) })} placeholder="React, Node, MongoDB" />
            </div>
            <div className="edit-form-group members-group">
              <label className="edit-form-label">Members Required</label>
              <input type="number" value={editPost.membersRequired} onChange={e => setEditPost({ ...editPost, membersRequired: e.target.value })} placeholder="2" />
            </div>
            <div className="edit-actions">
              <button className="btn-primary" onClick={() => handleEdit(post._id)}>Save</button>
              <button className="btn-secondary" onClick={() => setEditPost(null)}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Card body: grows to fill space ── */}
            <div className="card-body">
              <h3 className="card-title">{post.title}</h3>
              <div className="card-desc-wrapper">
                <p className={`card-desc ${expandedPosts[post._id] ? 'expanded' : ''}`}>
                  {post.description}
                </p>
                {post.description.length > 220 && (
                  <button type="button" className="read-more-btn" onClick={() => toggleExpand(post._id)}>
                    {expandedPosts[post._id] ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </div>
              <p><strong>Skills:</strong> {post.skillsRequired.join(', ')}</p>
              <p><strong>Posted by:</strong> {post.createdBy.name} — {post.createdBy.branch} {post.createdBy.year}</p>
              <p><strong>Members needed:</strong> {post.membersRequired}</p>
            </div>

            {/* ── Card footer: pinned to bottom ── */}
            <div className="card-footer">
              {isMyPost ? (
                <div>
                  {isPendingDelete && (
                    <div className="delete-confirm-box">
                      <p className="delete-confirm-text">⚠️ Are you sure you want to delete this post?</p>
                      <div className="delete-confirm-actions">
                        <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>Yes, Delete</button>
                        <button className="btn-secondary" onClick={handleDeleteCancel}>Cancel</button>
                      </div>
                    </div>
                  )}
                  <div className="action-row">
                    <button className="btn-applicants" onClick={() => setShowApplicants(showApplicants === post._id ? null : post._id)}>
                      👥 {post.applicants.length} Applicant{post.applicants.length !== 1 ? 's' : ''}
                    </button>
                    <button className="btn-edit" onClick={() => setEditPost({ _id: post._id, title: post.title, description: post.description, type: post.type, skillsRequired: post.skillsRequired, membersRequired: post.membersRequired })}>Edit</button>
                    {post.status === 'open' && (
                      <button className="btn-close-team" onClick={() => handleClose(post._id)}>Close Team</button>
                    )}
                    <button className="btn-delete" onClick={() => handleDeleteClick(post._id)}>Delete</button>
                  </div>
                  {showApplicants === post._id && (
                    <div className="applicants-list">
                      {post.applicants.length === 0 ? (
                        <p className="no-applicants">No applicants yet</p>
                      ) : (
                        post.applicants.map((a, index) => (
                          <div key={index} className="applicant-item">
                            <div>
                              <p className="applicant-name">🙋 {a.user?.name || 'Unknown'}</p>
                              <p className="applicant-detail">{a.user?.branch} — {a.user?.year}</p>
                              <p className="applicant-detail">Skills: {a.user?.skills?.join(', ')}</p>
                              <a href={'mailto:' + a.user?.email} className="contact-btn" rel="noreferrer">
                                📧 Contact Applicant
                              </a>
                            </div>
                            <div className="applicant-actions">
                              <span className={`status-badge status-badge--${a.status}`}>{a.status}</span>
                              {a.status === 'pending' && (
                                <div className="btn-accept-reject">
                                  <button className="btn-accept" onClick={() => handleApplicantStatus(post._id, a.user._id, 'accepted')}>Accept</button>
                                  <button className="btn-reject" onClick={() => handleApplicantStatus(post._id, a.user._id, 'rejected')}>Reject</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {post.status === 'closed' ? (
                    <span className="closed-apply-badge">🔒 Team already formed</span>
                  ) : alreadyApplied ? (
                    <span className="applied-badge">✓ Applied as Teammate</span>
                  ) : (
                    <button className="btn-apply" onClick={() => handleApply(post._id)}>Apply as Teammate</button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="board-container">
        <div className="board-header">
          <h2 className="board-title">Project & Hackathon Board</h2>
          {!showForm && (
            <button className="btn-primary" onClick={() => { setShowForm(true); setFormError(''); }}>
              + New Post
            </button>
          )}
        </div>

        {showForm && (
          <div className="form-wrapper">
            <div className="form-box">
              <h3 className="form-box-title">Create New Post</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" placeholder="Enter title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="project">Project</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe your project or hackathon" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Skills Required</label>
                  <input className="form-input" placeholder="React, Node, MongoDB" value={form.skillsRequired} onChange={e => setForm({ ...form, skillsRequired: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Members Required</label>
                  <input className="form-input" type="number" placeholder="2" value={form.membersRequired} onChange={e => setForm({ ...form, membersRequired: e.target.value })} />
                </div>
              </div>
              {formError && <p className="form-error">⚠️ {formError}</p>}
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { setShowForm(false); setFormError(''); }}>Cancel</button>
                <button className="btn-primary" onClick={handleCreate}>Post</button>
              </div>
            </div>
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Posts</button>
          <button className={`tab ${activeTab === 'my' ? 'active' : ''}`} onClick={() => setActiveTab('my')}>My Posts</button>
        </div>

        <div className="posts-grid">
          {activeTab === 'all'
            ? posts.filter(p => p.createdBy._id !== user.id).map(post => renderPostCard(post, false))
            : myPosts.length === 0
              ? renderEmptyMyPosts()
              : myPosts.map(post => renderPostCard(post, true))
          }
        </div>
      </div>
    </div>
  );
}

export default Board;