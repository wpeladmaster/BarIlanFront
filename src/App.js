import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';
import fetchGroupNames from './utils/fetchGroupNames';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const msalConfig = {
  auth: {
    clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7",
    redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com",
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          const userAccount = accounts[0];
          console.log("App.js: User Account Found:", userAccount);

          const tokenResponse = await msalInstance.acquireTokenSilent({
            account: userAccount,
            scopes: ["https://graph.microsoft.com/.default"],
          });

          setAccessToken(tokenResponse.accessToken);

          const groupIds = userAccount.idTokenClaims.groups || [];
          console.log("App.js: User Groups (IDs):", groupIds);

          const groupNames = await fetchGroupNames(groupIds, tokenResponse.accessToken);
          console.log("App.js: User Groups (Names):", groupNames);
          
          // Extract user details
          setUserName(userAccount.name || "User");
          setUserRole(userAccount.idTokenClaims?.groups || []);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("App.js: Error checking session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <main>
          <Header
            isAuthenticated={isAuthenticated}
            onLogout={() => {
              setIsAuthenticated(false);
              setUserName('');
              setUserRole([]);
            }}
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
    </MsalProvider>
  );
};

export default App;
