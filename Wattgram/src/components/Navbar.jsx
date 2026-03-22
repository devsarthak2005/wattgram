import React from 'react';
import { Link } from 'react-router-dom';
import { PenSquare, User, LogOut } from 'lucide-react';
import './Navbar.css';

export const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Wattgram
        </Link>
        <div className="navbar-links">
          <Link to="/create" className="nav-item">
            <PenSquare size={20} />
            <span className="nav-text">Write</span>
          </Link>
          <div className="nav-divider"></div>
          <Link to="/profile" className="nav-item">
            <User size={20} />
            <span className="nav-text">Profile</span>
          </Link>
          <Link to="/login" className="nav-item nav-logout">
            <LogOut size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
};
