import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Header.scss';

const Header = ({ msalInstance, isAuthenticated, onLogout, userName, userRole }) => {
  // Debugging: Log msalInstance and its state
  console.log("MSAL Instance in Header:", msalInstance);

  const handleLogin = async () => {
    try {
      const loginResponse = await msalInstance.loginPopup({
        scopes: ["user.read"], // Add required scopes
      });

      const { name, idTokenClaims } = loginResponse.account;
      const roles = idTokenClaims.groups || [];

      console.log("Login Successful:", name, roles);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await msalInstance.logoutPopup();
      onLogout();
    } catch (error) {
      console.error("Logout Error:", error);
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
