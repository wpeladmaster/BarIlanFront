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
  const { instance: msalInstance, accounts } = useMsal(); // MSAL instance and accounts
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [groupNames, setGroupNames] = useState([]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        console.log('App.js: Checking user session...');
        const accounts = msalInstance.getAllAccounts();
        if (!accounts.length) {
          console.log('App.js: No active accounts found.');
          setIsLoading(false);
          return;
        }

        const account = msalInstance.getActiveAccount() || accounts[0];
        msalInstance.setActiveAccount(account);

        const tokenResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        if (tokenResponse.accessToken) {
          console.log('App.js: Access token acquired.');
          setAccessToken(tokenResponse.accessToken);
        }

        const roles = account.idTokenClaims?.groups || [];
        setIsAuthenticated(true);
        setUserName(account.idTokenClaims.name);
        setUserRole(roles);

        const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
        setGroupNames(groupNames);
      } catch (error) {
        console.error('App.js: Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [msalInstance]);

  const handleLogin = async () => {
    try {
      console.log('App.js: Initiating login...');
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      msalInstance.setActiveAccount(loginResponse.account);

      const tokenResponse = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: loginResponse.account,
      });

      if (tokenResponse.accessToken) {
        console.log('App.js: Access token acquired during login.');
        setAccessToken(tokenResponse.accessToken);
      }

      const roles = loginResponse.account.idTokenClaims?.groups || [];
      setIsAuthenticated(true);
      setUserName(loginResponse.account.idTokenClaims.name);
      setUserRole(roles);

      const groupNames = await fetchGroupNames(roles, tokenResponse.accessToken);
      setGroupNames(groupNames);
    } catch (error) {
      console.error('App.js: Error during login:', error);
    }
  };

  const handleLogout = async () => {
    await msalInstance.logoutPopup();
    setIsAuthenticated(false);
    setUserName('');
    setUserRole([]);
    setAccessToken('');
    setGroupNames([]);
  };

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Router>
      <Header
        isAuthenticated={isAuthenticated}
        userName={userName}
        userRole={userRole}
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
            element={
              isAuthenticated ? (
                <HomePage userRole={userRole} groupNames={groupNames} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin-search"
            element={
              isAuthenticated && userRole.includes('Admins') ? (
                <AdminSearch groupNames={groupNames} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
