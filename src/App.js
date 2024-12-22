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

const App = () => {
  const { instance } = useMsal();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [userToken, setUserToken] = useState([]);
  const [groupNames, setGroupNames] = useState([]);

  const loginRequest = { scopes: [["api://saml_barilan/user_impersonation/.default"]] };

  useEffect(() => {
    const checkSession = async () => {
      console.log("App.js: Checking session...");
  
      if (!instance) {
        console.warn("App.js: MSAL instance is not initialized.");
        setIsLoading(false);
        return;
      }
  
      try {
        const allAccounts = instance.getAllAccounts();
        console.log("App.js: All accounts:", allAccounts);
  
        if (!allAccounts.length) {
          console.warn("App.js: No accounts found.");
          setIsLoading(false);
          return;
        }
  
        const account = instance.getActiveAccount() || allAccounts[0];
        instance.setActiveAccount(account);
        console.log("App.js: Active account:", account);
  
        if (!account) {
          console.warn("App.js: No active account set.");
          setIsLoading(false);
          return;
        }
  
        setIsAuthenticated(true);
        setUserName(account.name || account.username);
        const email = account.username.split('@')[0];
  
        // Token acquisition
        try {
          const tokenResponse = await instance.acquireTokenSilent({
            scopes: ["api://saml_barilan/user_impersonation/.default"]
          });
          const token = tokenResponse.accessToken;
  
          console.log("App.js: Token acquired successfully:", token);
  
          const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
          console.log("App.js: API URL:", apiUrl);
  
          const groups = await fetchGroupNames(apiUrl, token, email);
          console.log("App.js: Groups fetched:", groups);
  
          setGroupNames(groups);
          setUserRole(groups);
          setUserToken(token);
        } catch (tokenError) {
          console.error("App.js: Token acquisition error:", tokenError);
        }
  
      } catch (sessionError) {
        console.error("App.js: Error during session check:", sessionError);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkSession();
  }, [instance]);
  

  const handleLogin = async () => {
    try {
      console.log("App.js: Attempting login...");
      const loginResponse = await instance.loginPopup(loginRequest);
      console.log("App.js: Login successful:", loginResponse);

      instance.setActiveAccount(loginResponse.account);
      setIsAuthenticated(true);

      const email = loginResponse.account.username.split('@')[0];
      setUserName(loginResponse.account.name || loginResponse.account.username);

      const token = (await instance.acquireTokenSilent({ scopes: ["api://saml_barilan/user_impersonation/.default"] })).accessToken;
      console.log("App.js: Token acquired post-login.");

      const apiUrl = process.env.REACT_APP_API_GETAWAY_URL;
      console.log("App.js: API Gateway URL:", apiUrl);

      const groups = await fetchGroupNames(apiUrl, token, email);

      console.log("App.js: Groups fetched post-login:", groups);
      setGroupNames(groups);
      setUserRole(groups);
    } catch (error) {
      console.error("App.js: Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("App.js: Logging out...");
      await instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
      setIsAuthenticated(false);
      setUserName('');
      setUserRole([]);
      setGroupNames([]);
      console.log("App.js: Logout successful.");
    } catch (error) {
      console.error("App.js: Logout error:", error);
    }
  };

  if (isLoading) {
    console.log("App.js: Loading...");
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
          <Route path="/homepage" element={isAuthenticated ? <HomePage userToken={userToken} userRole={userRole} groupNames={groupNames} /> : <Navigate to="/" />} />
          <Route path="/admin-search" element={isAuthenticated && userRole.includes('Admins') ? <AdminSearch groupNames={groupNames} /> : <Navigate to="/" />} />
        </Routes>
        <Footer />
      </main>
    </Router>
  );
};

export default App;
