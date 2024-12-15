import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7",
    redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com",
  },
};

// Initialize MSAL instance once
const msalInstance = new PublicClientApplication(msalConfig);
console.log("MSAL Instance Initialized in App.js:", msalInstance);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    console.log("App.js: Running useEffect to check user session.");
    const checkUserSession = async () => {
      try {
        console.log("App.js: Checking MSAL accounts...");
        const accounts = msalInstance.getAllAccounts();
        console.log("App.js: Accounts found:", accounts);

        if (accounts.length > 0) {
          const userAccount = accounts[0];
          const claims = userAccount.idTokenClaims;
          console.log("App.js: User account and claims:", userAccount, claims);

          setUserName(userAccount.name);
          setUserRole(claims.groups || []);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("App.js: Error checking session:", err);
      } finally {
        console.log("App.js: Finished checking session.");
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (isLoading) {
    console.log("App.js: Application is loading...");
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <main>
        <Header
          msalInstance={msalInstance}
          isAuthenticated={isAuthenticated}
          onLogout={() => setIsAuthenticated(false)}
          userName={userName}
          userRole={userRole}
        />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
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
