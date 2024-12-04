import React, { useState } from 'react';
import axios from 'axios';

const CommandForm = () => {
  const [command, setCommand] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://3lgge7qe53.execute-api.us-east-1.amazonaws.com/stage_media_recorder', {
        command: `MRCmd.exe ${command}`
      });
      console.log('Response:', response.data);
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
