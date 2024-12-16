import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss';
import { useMsal } from '@azure/msal-react';

const Header = ({ isAuthenticated, onLogout, userName, userRole, onLogin }) => {
  console.log("Header.js: isAuthenticated:", isAuthenticated);
  console.log("Header.js: userName:", userName);
  console.log("Header.js: userRole:", userRole);

  const { instance: msalInstance } = useMsal();

  const handleLogin = async () => {
    try {
      console.log("Header.js: Starting login...");
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["user.read"],
      });
      console.log("Header.js: Login successful:", loginResponse.account);
      onLogin(loginResponse.account); // Notify App.js to update session state
    } catch (error) {
      console.error("Header.js: Login Error:", error);
      alert("Login failed. Please try again.");
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
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <header className="header">
      {/* Authentication Controls */}
      <div className="auth-wrap">
        {isAuthenticated ? (
          <div className="auth-inner">
            <button onClick={handleLogout} className="logout-btn">Logout</button>
            <span className="welcome-text">Welcome, {userName || "User"}!</span>
          </div>
        ) : (
          <div className="auth-inner">
            <button onClick={handleLogin} className="login-btn">Login</button>
          </div>
        )}
      </div>

      {/* Logo Section */}
      <div className="logo">
        <img
          src="/images/bar-ilan-logo.png" // Updated to ensure proper relative path
          alt="Bar-Ilan Logo"
          className="logo-img"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          {isAuthenticated && userRole.includes("Admins") && (
            <li className="nav-item">
              <Link to="/admin-search" className="nav-link">Admin Search</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
