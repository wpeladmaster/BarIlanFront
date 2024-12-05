import React, { useState } from 'react';

const CommandForm2 = () => {
  const [command, setCommand] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!command) {
        throw new Error('Command cannot be empty');
      }

      const response = await fetch('http://localhost:3002/run-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response:', result);
    } catch (error) {
      console.error('Error:', error.message);
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

export default CommandForm2;