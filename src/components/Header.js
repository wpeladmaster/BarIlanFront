import React from 'react';

const Header = ({ isAuthenticated, onLogout, onLogin, userName }) => {
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
            <button onClick={onLogin}>Login</button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
