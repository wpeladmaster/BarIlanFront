import React from 'react';
import ReactDOM from 'react-dom';
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App';

const msalConfig = {
  auth: {
    clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120", // Replace with your actual Azure AD client ID
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2", // Update with your authority URL
    redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage" // Update with your actual redirect URI
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (!containsPii) {
          console.log(message);
        }
      },
      logLevel: LogLevel.Verbose,
      piiLoggingEnabled: false,
    },
  },
};

// Create the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
