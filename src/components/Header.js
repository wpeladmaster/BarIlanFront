import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss';

const Header = ({ isAuthenticated, userName, userRole, onLogin, onLogout }) => {
  return (
    <header className="header">
      <div className="auth-wrap">
        {isAuthenticated ? (
          <div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
            <span>Welcome, {userName}!</span>
          </div>
        ) : (
          <button onClick={onLogin} className="login-btn">Login</button>
        )}
      </div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {isAuthenticated && userRole.includes('Admins') && (
            <li><Link to="/admin-search">Admin Search</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
