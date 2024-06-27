import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import './App.css';

const ENDPOINT = "http://127.0.0.1:5000";

function App() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("update", data => {
      setMessage(data.message);
    });

    return () => socket.disconnect();
  }, []);

  const handleGroupsUpload = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    await axios.post(`${ENDPOINT}/upload-groups`, data, {
      headers: { 'x-access-token': token }
    });
  };

  const handleHostelsUpload = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    await axios.post(`${ENDPOINT}/upload-hostels`, data, {
      headers: { 'x-access-token': token }
    });
  };

  const handleRegister = async () => {
    await axios.post(`${ENDPOINT}/register`, { username, password });
  };

  const handleLogin = async () => {
    const response = await axios.post(`${ENDPOINT}/login`, { username, password });
    setToken(response.data.token);
  };

  return (
    <div className="App">
      <h1>Group Accommodation Allocation</h1>
      <div>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleRegister}>Register</button>
        <button onClick={handleLogin}>Login</button>
      </div>
      <input type="file" onChange={handleGroupsUpload} />
      <input type="file" onChange={handleHostelsUpload} />
      <p>{message}</p>
    </div>
  );
}

export default App;
