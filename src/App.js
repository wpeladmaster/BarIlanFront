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
  const { instance } = useMsal(); // Access MSAL instance
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');

  const checkUserSession = async () => {
    try {
      console.log('App.js: Checking user session...');
      const accounts = instance.getAllAccounts();

      if (accounts.length === 0) {
        console.warn('App.js: No accounts found. Triggering login...');
        await instance.loginPopup(loginRequest);
      }

      const userAccount = instance.getAllAccounts()[0];
      const tokenResponse = await instance.acquireTokenSilent({
        account: userAccount,
        scopes: loginRequest.scopes,
      });

      setAccessToken(tokenResponse.accessToken);
      setUserName(userAccount.name || 'User');

      const groupIds = userAccount.idTokenClaims.groups || [];
      const groupNames = await fetchGroupNames(groupIds, tokenResponse.accessToken);

      setUserRole(groupNames || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('App.js: Error during session check:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, [instance]);

  const handleLogout = async () => {
    try {
      console.log('App.js: Logging out...');
      await instance.logoutPopup();
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setAccessToken('');
    } catch (error) {
      console.error('App.js: Logout error:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <main>
        <Header
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          userName={userName}
          userRole={userRole}
        />
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />}
          />
          <Route
            path="/homepage"
            element={isAuthenticated ? <HomePage userRole={userRole} /> : <Navigate to="/" />}
          />
          <Route
            path="/admin-search"
            element={
              isAuthenticated && userRole.includes('Admins') ? (
                <AdminSearch />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
};

export default App;
