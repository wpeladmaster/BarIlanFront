import React from 'react';

const Header = ({ isAuthenticated, onLogout, userName }) => {
  return (
    <header>
      <nav>
        <div>
          <h1>Welcome, {isAuthenticated ? userName : 'Guest'}</h1>
        </div>
        <div>
          {isAuthenticated ? (
            <button onClick={onLogout}>Logout</button>
          ) : (
            <button onClick={() => window.location.href = '/'}>Login</button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
