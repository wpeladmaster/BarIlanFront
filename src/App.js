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
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
    redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com"
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userCustomId, setuserCustomId] = useState('');

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Check for existing MSAL accounts
        const accounts = msalInstance.getAllAccounts();
        const userAccount = accounts[0];

        if (userAccount) {
          // User is authenticated
          const claims = userAccount.idTokenClaims;
          setUserName(claims.name);
          setUserRole(claims.groups || []);
          setIsAuthenticated(true);
          console.log('userAccount:', userAccount);
        } else {
          // User is not authenticated
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
        console.error(err);
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
    <Router>
      <main>
        <Header msalInstance={msalInstance} onLogout={() => setIsAuthenticated(false)} userName={userName} userRole={userRole} />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
          <Route
            path="/homepage"
            element={isAuthenticated ? <HomePage msalInstance={msalInstance} userRole={userRole} userCustomId={userCustomId} /> : <Navigate to="/" />}
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
