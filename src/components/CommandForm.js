import React, { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: "aadb3f2f-d35f-4080-bc72-2ee32b741120",
    authority: "https://login.microsoftonline.com/352ed1fa-2f18-487f-a4cf-4804faa235c7/saml2",
    redirectUri: "http://localhost:3000"
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

const CommandForm = () => {
  const [command, setCommand] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {

      if (!command) {
        throw new Error('Command cannot be empty');
      }
      
      const token = (await msalInstance.acquireTokenSilent({
        scopes: ["api://your_api_app_id/access_as_user"] // Replace with your API's app ID URI
      })).accessToken;

      const body = JSON.stringify({
        command: `MRCmd.exe ${command}`
      });
      
      const response = await fetch('https://q4p3q6lqab.execute-api.us-east-1.amazonaws.com/recorder-test/media-recorder', {
        
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        body: body
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Media Recorder Command</h2>
      <form onSubmit={handleSubmit}>
        <select onChange={(e) => setCommand(e.target.value)} value={command}>
          <option value="">Select Command</option>
          <option value="/E">Start MediaRecorder</option>
          <option value="/R">Start Recording</option>
          <option value="/S">Stop Recording</option>
          <option value="/X">Close MediaRecorder</option>
          <option value="/C=[filename.mrs]">Load Configuration File</option>
          <option value="/B=[basename]">Set File Base Name</option>
        </select>
        <button type="submit">Send Command</button>
      </form>
    </div>
  );
};

export default CommandForm;
