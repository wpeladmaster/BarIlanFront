// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import App from './App';

const msalConfig = {
  auth: {
    clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120", // Replace with your actual Azure AD client ID
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2", // Update with your authority URL
    redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage" // Update with your actual redirect URI
  }
};

// Create an MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <App msalInstance={msalInstance} />
  </React.StrictMode>,
  document.getElementById('root')
);
