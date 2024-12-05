import React, { useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';

const CommandForm = () => {
  const [command, setCommand] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const token = (await fetchAuthSession()).tokens?.idToken?.toString();
      const response = await fetch('https://3lgge7qe53.execute-api.us-east-1.amazonaws.com/stage_media_recorder', {
        method: 'POST',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: `MRCmd.exe ${command}`
        })
      });

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
