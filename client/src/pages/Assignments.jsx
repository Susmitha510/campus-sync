import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './Assignments.css';

const CACHE_KEY = '__cs_assignments__';

function Assignments() {
  const [assignments, setAssignments] = useState(
    () => window[CACHE_KEY] || []
  );
  const [loading, setLoading] = useState(!window[CACHE_KEY]);
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', subject: '', dueDate: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const token = localStorage.getItem('token');
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAssignments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await axios.get('https://campus-sync-production.up.railway.app/api/assignments', {
        headers: { Authorization: token }
      });
      window[CACHE_KEY] = res.data;
      setAssignments(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleAdd = async () => {
    if (!form.title.trim()) { setErrorMsg('Please enter a title'); return; }
    if (!form.subject.trim()) { setErrorMsg('Please enter a subject'); return; }
    if (!form.dueDate) { setErrorMsg('Please select a due date'); return; }
    if (form.dueDate < today) { setErrorMsg('Due date cannot be in the past'); return; }
    setErrorMsg('');
    try {
      await axios.post('https://campus-sync-production.up.railway.app/api/assignments', form, {
        headers: { Authorization: token }
      });
      setForm({ title: '', subject: '', dueDate: '' });
      setShowForm(false);
      fetchAssignments();
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await axios.put('https://campus-sync-production.up.railway.app/api/assignments/' + id + '/complete',
        { completed: !currentStatus },
        { headers: { Authorization: token } }
      );
      fetchAssignments();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteClick = (id) => setConfirmDeleteId(id);

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete('https://campus-sync-production.up.railway.app/api/assignments/' + confirmDeleteId, {
        headers: { Authorization: token }
      });
      setConfirmDeleteId(null);
      fetchAssignments();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteCancel = () => setConfirmDeleteId(null);

  const startEdit = (a) => {
    setEditId(a._id);
    setEditForm({
      title: a.title,
      subject: a.subject,
      dueDate: a.dueDate ? a.dueDate.substring(0, 10) : ''
    });
  };

  const handleEdit = async (id) => {
    try {
      await axios.put('https://campus-sync-production.up.railway.app/api/assignments/' + id, editForm, {
        headers: { Authorization: token }
      });
      setEditId(null);
      fetchAssignments();
    } catch (err) {
      console.log(err);
    }
  };

  const renderEmptyState = () => (
    <div className="assignment-empty-state">
      <div className="assignment-empty-icon">📚</div>
      <h3 className="assignment-empty-title">No assignments yet</h3>
      <p className="assignment-empty-desc">
        Stay on top of your deadlines. Add your first assignment to get started.
      </p>
      <button
        className="btn-primary"
        onClick={() => {
          setShowForm(true);
          setErrorMsg('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        + Add Your First Assignment
      </button>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="assignments-page">

        <div className="assignments-header">
          <h2 className="assignments-title">Assignment Tracker</h2>
          {!showForm && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Add Assignment
            </button>
          )}
        </div>

        {showForm && (
          <div className="assignment-form-card">
            <div className="assignment-form-body">
              <h3 className="assignment-form-title">Create New Assignment</h3>
              <div className="assignment-form-grid">
                <div className="assignment-field-group">
                  <label className="assignment-label">Title</label>
                  <input
                    className="assignment-input"
                    placeholder="Enter title"
                    value={form.title}
                    onChange={e => { setForm({ ...form, title: e.target.value }); setErrorMsg(''); }}
                  />
                </div>
                <div className="assignment-field-group">
                  <label className="assignment-label">Subject</label>
                  <input
                    className="assignment-input"
                    placeholder="e.g. Computer Science"
                    value={form.subject}
                    onChange={e => { setForm({ ...form, subject: e.target.value }); setErrorMsg(''); }}
                  />
                </div>
              </div>
              <div className="assignment-field-group">
                <label className="assignment-label">Due Date</label>
                <input
                  className="assignment-input"
                  type="date"
                  min={today}
                  value={form.dueDate}
                  onChange={e => { setForm({ ...form, dueDate: e.target.value }); setErrorMsg(''); }}
                />
              </div>
              {errorMsg && <p className="assignment-error">⚠️ {errorMsg}</p>}
              <div className="assignment-form-footer">
                <button className="btn-secondary" onClick={() => { setShowForm(false); setErrorMsg(''); setForm({ title: '', subject: '', dueDate: '' }); }}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleAdd}>Add</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="assignment-empty-state">
            <div className="assignment-empty-icon">⏳</div>
            <h3 className="assignment-empty-title">Loading assignments…</h3>
          </div>
        ) : !showForm && assignments.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="assignments-list">
            {assignments.map(a => (
              <div key={a._id} className="assignment-card">
                {editId === a._id ? (
                  <div className="edit-form">
                    <div className="edit-field-group">
                      <label className="edit-label">Title</label>
                      <input className="edit-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                    </div>
                    <div className="edit-field-group">
                      <label className="edit-label">Subject</label>
                      <input className="edit-input" value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} placeholder="Subject" />
                    </div>
                    <div className="edit-field-group">
                      <label className="edit-label">Due Date</label>
                      <input className="edit-input" type="date" min={today} value={editForm.dueDate} onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })} />
                    </div>
                    <div className="edit-actions">
                      <button className="btn-save" onClick={() => handleEdit(a._id)}>Save</button>
                      <button className="btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="assignment-card-content">
                    {confirmDeleteId === a._id && (
                      <div className="delete-confirm-box">
                        <p className="delete-confirm-text">⚠️ Delete this assignment?</p>
                        <div className="delete-confirm-actions">
                          <button className="btn-confirm-delete" onClick={handleDeleteConfirm}>Yes, Delete</button>
                          <button className="btn-secondary" onClick={handleDeleteCancel}>Cancel</button>
                        </div>
                      </div>
                    )}
                    <div className="assignment-card-row">
                      <div className="assignment-card-info">
                        <h3 className={`assignment-card-title ${a.completed ? 'completed' : ''}`}>{a.title}</h3>
                        <p className="assignment-card-subject">{a.subject}</p>
                        <p className="assignment-card-date">Due: {new Date(a.dueDate).toDateString()}</p>
                      </div>
                      <div className="assignment-actions">
                        {!a.completed ? (
                          <button className="btn-complete" onClick={() => handleToggleComplete(a._id, a.completed)}>Mark Done</button>
                        ) : (
                          <button className="btn-undo" onClick={() => handleToggleComplete(a._id, a.completed)}>↩ Undo</button>
                        )}
                        <button className="btn-edit" onClick={() => startEdit(a)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteClick(a._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Assignments;