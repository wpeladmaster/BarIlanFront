import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss'; 

const Header = ({ isAuthenticated, onLogout, onLogin, userName }) => {
  return (
    <header>
      <div className="auth-wrap">
        {isAuthenticated ? (
          <div className='inner'>
            <button onClick={onLogout}>Logout</button>
            <span>Welcome, {isAuthenticated ? userName : 'Guest'}</span>
          </div>
        ) : (
          <div className='inner'>
            <button onClick={onLogin}>Login</button>
          </div>
        )}
      </div>
      <div className='logo'>
        <img src='../../images/bar-ilan-logo.png' alt='Logo' />
      </div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          {/* {userRole && userRole.includes('Admins') && (
            <li><Link to="/admin-search">Admin Search</Link></li>
          )} */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
