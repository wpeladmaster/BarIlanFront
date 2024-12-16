import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isAuthenticated, onLogout, userName, userRole }) => {
  return (
    <header>
      <div className="header-content">
        <h1>Welcome, {userName}</h1>
        <nav>
          {isAuthenticated && userRole.includes('Admins') && (
            <Link to="/admin-search">Admin Search</Link>
          )}
          <button onClick={onLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
