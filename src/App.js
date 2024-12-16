import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './style/global.scss';

import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import fetchGroupNames from './utils/fetchGroupNames';
import { loginRequest } from './authConfig';

const App = () => {
  const { instance: msalInstance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]);

  // Initialize session on app load
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const accounts = msalInstance.getAllAccounts();
        if (!accounts.length) {
          setIsLoading(false);
          return;
        }

        const account = accounts[0];
        msalInstance.setActiveAccount(account);

        // Silent token acquisition
        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        setAccessToken(tokenResponse.accessToken);
        setIsAuthenticated(true);
        setUserName(account.idTokenClaims.name || 'User');
        const roles = account.idTokenClaims?.groups || [];
        setUserRole(roles);

        // Fetch group names based on roles
        const fetchedGroups = await fetchGroupNames(roles, tokenResponse.accessToken);
        setGroupNames(fetchedGroups);
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [msalInstance]);

  // Handle login
  const handleLogin = async () => {
    try {
      console.log('App.js: Initiating login...');
      const loginResponse = await msalInstance.loginPopup(loginRequest); // Trigger login popup
      msalInstance.setActiveAccount(loginResponse.account); // Set active account after login
  
      // Fetch access token silently
      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: loginResponse.account,
      });
  
      if (tokenResponse.accessToken) {
        console.log('App.js: Access token acquired during login.');
        setAccessToken(tokenResponse.accessToken); // Update state with access token
      }
  
      const roles = loginResponse.account.idTokenClaims?.groups || []; // Fetch user roles
      setIsAuthenticated(true); // Update authentication state
      setUserName(loginResponse.account.idTokenClaims.name); // Set user name
      setUserRole(roles); // Set roles
  
      // Fetch and update group names for roles
      const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
      setGroupNames(groupNames);
    } catch (error) {
      console.error('App.js: Error during login:', error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await msalInstance.logoutPopup();
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setAccessToken('');
      setGroupNames([]);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) return <div className="loading-screen">Loading...</div>;

  return (
    <Router>
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userRole={userRole}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/homepage" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/homepage"
            element={isAuthenticated ? (
              <HomePage userRole={userRole} groupNames={groupNames} />
            ) : (
              <Navigate to="/" replace />
            )}
          />
          <Route
            path="/admin-search"
            element={isAuthenticated && userRole.includes('Admins') ? (
              <AdminSearch groupNames={groupNames} />
            ) : (
              <Navigate to="/" replace />
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
