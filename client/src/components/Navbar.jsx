// Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navLinks = [
    { label: 'Board',        to: '/board'       },
    { label: 'Assignments',  to: '/assignments'  },
    { label: 'Experiences',  to: '/experiences'  },
    { label: 'Career Check', to: '/career'       },
    { label: 'Profile',      to: '/profile'      },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <h2 className="navbar-logo">CampusSync</h2>

        {/* Hamburger button — visible only on mobile */}
        <button
          className={`navbar-hamburger ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        {/* Nav links */}
        <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
          {navLinks.map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-link ${isActive(to) ? 'navbar-link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {isActive(to) && <span className="navbar-active-dot" />}
            </Link>
          ))}
          <button
            className="navbar-logout-btn"
            onClick={() => { setMenuOpen(false); setShowModal(true); }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Logout confirmation modal */}
      {showModal && (
        <div className="navbar-overlay" onClick={() => setShowModal(false)}>
          <div className="navbar-modal" onClick={e => e.stopPropagation()}>
            <h3 className="navbar-modal-title">Logout</h3>
            <p className="navbar-modal-text">Are you sure you want to logout?</p>
            <div className="navbar-modal-actions">
              <button className="navbar-cancel-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="navbar-confirm-btn" onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;