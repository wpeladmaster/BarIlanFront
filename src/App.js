import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import fetchGroupNames from './utils/fetchGroupNames'; // Import the utility function

const App = ({ msalInstance }) => {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [groupNames, setGroupNames] = useState([]);

  const loginRequest = { scopes: ["User.Read"] };

  useEffect(() => {
    const checkSession = async () => {
      try {
        if (!instance) {
          setIsLoading(false);
          return;
        }

        const allAccounts = instance.getAllAccounts();
        if (!allAccounts.length) {
          setIsLoading(false);
          return;
        }

        const account = instance.getActiveAccount() || allAccounts[0];
        instance.setActiveAccount(account);

        if (account) {
          console.log("account:", account);
          
          setIsAuthenticated(true);
          setUserName(account.name || account.username);
          const email = account.username.split('@')[0];

          const token = (await instance.acquireTokenSilent({
            scopes: ["User.Read"],
          })).accessToken;

          console.log("token:", token);

          const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
          const groups = await fetchGroupNames(apiUrl, token, email);
          setGroupNames(groups);
          setUserRole(groups);
        }
      } catch (error) {
        console.error('Error during session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [instance]);

  const handleLogin = async () => {
    try {
      const loginResponse = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(loginResponse.account);

      setIsAuthenticated(true);
      setUserName(loginResponse.account.name || loginResponse.account.username);
      const email = loginResponse.account.username.split('@')[0];

      const token = (await instance.acquireTokenSilent({
        scopes: ["User.Read"],
      })).accessToken;

      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      const groups = await fetchGroupNames(apiUrl, token, email);
      setGroupNames(groups);
      setUserRole(groups);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setGroupNames([]);
    } catch (error) {
      console.error('Logout error:', error);
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
          onLogin={handleLogin}
          onLogout={handleLogout}
          userName={userName}
        />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
          <Route path="/homepage" element={isAuthenticated ? <HomePage userRole={userRole} groupNames={groupNames} /> : <Navigate to="/" />} />
          <Route path="/admin-search" element={isAuthenticated && userRole.includes('Admins') ? <AdminSearch groupNames={groupNames} /> : <Navigate to="/" />} />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
};

export default App;
