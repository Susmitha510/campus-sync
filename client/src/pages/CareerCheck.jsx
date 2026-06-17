import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './CareerCheck.css';

function CareerCheck() {
  const [form, setForm] = useState({
    name: '',
    branch: '',
    year: '',
    skills: '',
    domain: '',
    goal: ''
  });
  const [analysis, setAnalysis] = useState('');
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://campus-sync-pklq.onrender.com/api/profile', {
          headers: { Authorization: token }
        });
        setForm(prev => ({
          ...prev,
          name: res.data.name,
          branch: res.data.branch,
          year: res.data.year,
          skills: res.data.skills.join(', ')
        }));
      } catch (err) {
        console.log(err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleAnalyze = async () => {
    if (!form.name.trim())   { setErrorMsg('Please enter your name'); return; }
    if (!form.branch.trim()) { setErrorMsg('Please enter your branch'); return; }
    if (!form.year.trim())   { setErrorMsg('Please enter your year'); return; }
    if (!form.skills.trim()) { setErrorMsg('Please enter at least one skill'); return; }
    if (!form.domain.trim()) { setErrorMsg('Please enter your interested domain'); return; }
    if (!form.goal.trim())   { setErrorMsg('Please enter your career goal'); return; }

    setErrorMsg('');
    setLoading(true);
    setAnalysis('');
    setScore(null);
    try {
      const res = await axios.post('https://campus-sync-pklq.onrender.com/api/career/analyze', form, {
        headers: { Authorization: token }
      });
      setAnalysis(res.data.analysis);
      setScore(res.data.score);
    } catch (err) {
      setAnalysis('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const getScoreClass = (s) => {
    if (s >= 70) return 'score-good';
    if (s >= 40) return 'score-average';
    return 'score-low';
  };

  const getScoreLabel = (s) => {
    if (s >= 70) return 'Good — You are close to job ready!';
    if (s >= 40) return 'Average — You need to upskill significantly';
    return 'Low — You have a lot of work to do';
  };

  const formatAnalysis = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('SCORE:')) return null;
      if (line.match(/^[A-Z_]+:/)) {
        const heading = line.split(':')[0].replace(/_/g, ' ');
        const content = line.split(':').slice(1).join(':');
        return (
          <div key={index}>
            <h3 className="career-analysis-heading">{heading}</h3>
            {content && <p className="career-analysis-text">{content.replace(/\*\*/g, '')}</p>}
          </div>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={index} className="career-analysis-list">{line.replace(/^\* |^- /, '').replace(/\*\*/g, '')}</li>;
      }
      if (line.trim() === '') return <br key={index} />;
      return <p key={index} className="career-analysis-text">{line.replace(/\*\*/g, '')}</p>;
    });
  };

  const update = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrorMsg('');
  };

  return (
    <div>
      <Navbar />
      <div className="career-page">

        {/* Page Header */}
        <div className="career-page-header">
          <h2 className="career-page-title">Career Reality Check</h2>
          <p className="career-page-subtitle">
            Get a brutally honest analysis of where you stand vs what the industry wants in 2026
          </p>
        </div>

        {/* Form Card */}
        <div className="career-form-card">
          <div className="career-top-border" />
          <div className="career-form-body">
            <h3 className="career-form-title">Your Profile</h3>

            {/* Row 1: Name | Branch */}
            <div className="career-form-grid">
              <div className="career-field-group">
                <label className="career-label">Name</label>
                <input
                  className="career-input"
                  placeholder="e.g. Susmitha P"
                  value={form.name}
                  onChange={update('name')}
                />
              </div>
              <div className="career-field-group">
                <label className="career-label">Branch</label>
                <input
                  className="career-input"
                  placeholder="e.g. CSE, ECE"
                  value={form.branch}
                  onChange={update('branch')}
                />
              </div>
            </div>

            {/* Row 2: Year | Skills */}
            <div className="career-form-grid career-form-grid-mt">
              <div className="career-field-group">
                <label className="career-label">Year</label>
                <input
                  className="career-input"
                  placeholder="e.g. 2nd, 3rd, 4th"
                  value={form.year}
                  onChange={update('year')}
                />
              </div>
              <div className="career-field-group">
                <label className="career-label">Current Skills</label>
                <input
                  className="career-input"
                  placeholder="e.g. React, Node, MongoDB"
                  value={form.skills}
                  onChange={update('skills')}
                />
              </div>
            </div>

            {/* Domain — full width */}
            <div className="career-field-group career-field-group-mt">
              <label className="career-label">Interested Domain</label>
              <input
                className="career-input"
                placeholder="e.g. Web Development, Data Science, AI"
                value={form.domain}
                onChange={update('domain')}
              />
            </div>

            {/* Goal — full width */}
            <div className="career-field-group career-field-group-mt">
              <label className="career-label">Career Goal</label>
              <input
                className="career-input"
                placeholder="e.g. Get placed in a product company"
                value={form.goal}
                onChange={update('goal')}
              />
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="career-error-banner">⚠️ {errorMsg}</div>
            )}

            {/* Submit */}
            <div className="career-form-footer">
              <button
                className="career-analyze-button"
                onClick={handleAnalyze}
                disabled={loading}
              >
                {loading ? '🔍 Analysing your profile...' : 'Get My Career Reality Check'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="career-loading-box">
            <p className="career-loading-text">🔍 Analysing your profile against current industry requirements...</p>
          </div>
        )}

        {/* Score Card */}
        {score !== null && (
          <div className="career-result-card">
            <div className="career-top-border" />
            <div className="career-form-body">
              <h3 className="career-result-section-title">Your Readiness Score</h3>
              <div className={`career-score-number ${getScoreClass(score)}`}>
                {score}%
              </div>
              <div className="career-progress-bar-bg">
                <div
                  className={`career-progress-bar-fill ${getScoreClass(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className={`career-score-label ${getScoreClass(score)}`}>
                {getScoreLabel(score)}
              </p>
            </div>
          </div>
        )}

        {/* Analysis Card */}
        {analysis && (
          <div className="career-result-card">
            <div className="career-top-border" />
            <div className="career-form-body">
              <h3 className="career-result-section-title">Detailed Analysis</h3>
              <div className="career-analysis-content">
                {formatAnalysis(analysis)}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CareerCheck;