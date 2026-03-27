import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, User, LogOut, Compass, Moon, Sun, MessageCircle } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Wattgram
        </Link>
        <div className="navbar-links">
          <button onClick={toggleTheme} className="nav-item theme-toggle-btn" title="Toggle Theme" style={{background: 'none', border: 'none', cursor: 'pointer', outline: 'none'}}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="nav-divider"></div>
          <Link to="/explore" className="nav-item">
            <Compass size={20} />
            <span className="nav-text">Explore</span>
          </Link>
          <Link to="/create" className="nav-item">
            <PenSquare size={20} />
            <span className="nav-text">Write</span>
          </Link>
          <Link to="/chat" className="nav-item">
            <MessageCircle size={20} />
            <span className="nav-text">Chat</span>
          </Link>
          <div className="nav-divider"></div>
          <Link to="/profile" className="nav-item">
            <User size={20} />
            <span className="nav-text">Profile</span>
          </Link>
          <Link to="/login" className="nav-item nav-logout" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); }}>
            <LogOut size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
};
