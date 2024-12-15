import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss';
import { useMsal } from '@azure/msal-react';

const Header = ({ isAuthenticated, onLogout, userName, userRole }) => {
  console.log("Header.js: isAuthenticated:", isAuthenticated);
  console.log("Header.js: userName:", userName);
  console.log("Header.js: userRole:", userRole);

  const { instance: msalInstance } = useMsal();

  const handleLogin = async () => {
    try {
      console.log("Header.js: Starting login...");
      await msalInstance.loginPopup({
        scopes: ["user.read"],
      });
      console.log("Header.js: Login successful.");
      window.location.reload(); // Refresh to sync session state with App.js
    } catch (error) {
      console.error("Header.js: Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Header.js: Logging out...");
      await msalInstance.logoutPopup();
      onLogout(); // Notify App.js to update session state
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
            <span>Welcome, {userName || "User"}!</span>
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
          {isAuthenticated && userRole.includes("Admins") && (
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
