import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './style/global.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminSearch from './components/AdminSearch';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState([]);
  const [userCustomId, setUserCustomId] = useState('');

  return (
    <Router>
      <main>
        <Header
          setIsAuthenticated={setIsAuthenticated}
          setUserName={setUserName}
          setUserRole={setUserRole}
          setUserCustomId={setUserCustomId}
        />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/homepage" /> : <Login />} />
          <Route
            path="/homepage"
            element={
              isAuthenticated ? (
                <HomePage userRole={userRole} userCustomId={userCustomId} />
              ) : (
                <Navigate to="/" />
              )
            }
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
