import React from 'react';
import ReactDOM from 'react-dom';
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import App from './App';

const msalConfig = {
  auth: {
    clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
    redirectUri: "https://main.d3u5rxv1b6pn2o.amplifyapp.com/homepage",
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
      logLevel: LogLevel.Info,
      piiLoggingEnabled: false,
    },
  },
};

// Create the MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Function to initialize MSAL and render the app
const initializeApp = async () => {
  try {
    // Ensure MSAL is fully initialized
    await msalInstance.initialize();
    console.log("MSAL initialized successfully.");

    // Render the app after successful initialization
    ReactDOM.render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      </React.StrictMode>,
      document.getElementById('root')
    );
  } catch (error) {
    console.error("Failed to initialize MSAL:", error);
  }
};

// Initialize the app
initializeApp();
