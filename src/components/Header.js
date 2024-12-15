import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss';

const Header = ({ msalInstance, isAuthenticated, onLogout, userName, userRole }) => {
  // Debugging: Log msalInstance and state
  console.log("Header.js: Received msalInstance:", msalInstance);
  console.log("Header.js: Authentication state:", isAuthenticated);

  const handleLogin = async () => {
    try {
      console.log("Header.js: Starting login...");
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["user.read"], // Add required scopes
      });
      console.log("Header.js: Login successful:", loginResponse);

      const { name, idTokenClaims } = loginResponse.account;
      const roles = idTokenClaims.groups || [];
      console.log("Header.js: User details:", name, roles);
    } catch (error) {
      console.error("Header.js: Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Header.js: Logging out...");
      await msalInstance.logoutPopup();
      onLogout();
      console.log("Header.js: Logout successful.");
    } catch (error) {
      console.error("Header.js: Logout Error:", error);
    }
  };

  return (
    <header>
      <div className="auth-wrap">
        {isAuthenticated ? (
          <div className="inner">
            <button onClick={handleLogout}>Logout</button>
            <span>Welcome, {userName}</span>
          </div>
        ) : (
          <div className="inner">
            <button onClick={handleLogin}>Login</button>
          </div>
        )}
      </div>
      <div className="logo">
        <img src="../../images/bar-ilan-logo.png" alt="Logo" />
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {userRole.includes("Admins") && (
            <li>
              <Link to="/admin-search">Admin Search</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
