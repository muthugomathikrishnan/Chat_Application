
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://10.16.49.195:4000');

function App() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.on('message', (msg) => {
            setMessages((prevMessages) => [...prevMessages, msg]);
        });

        return () => {
            socket.off('message');
        };
    }, []);

    const sendMessage = () => {
        if (message) {
            socket.emit('message', message);
            setMessage('');
        }
    };

    return (
        <div>
            <h1>Socket.IO Chat</h1>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div>
                <h2>Messages:</h2>
                <ul>
                    {messages.map((msg, index) => (
                        <li key={index}>{msg}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
----------------------------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Channels from './pages/Channels';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat.js';
import Login  from './pages/Login.js';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  
  }, []);

  return (
    <Router>
      <div className="app">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />} {/* Pass the function */}
        <main>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
            <Route path="/messages" element={<Messages isAuthenticated={isAuthenticated} />} />
            <Route path="/chat" element={<Chat isAuthenticated={isAuthenticated} />} />
            <Route path="/groups" element={<Groups isAuthenticated={isAuthenticated} />} />
            <Route path="/channels" element={<Channels isAuthenticated={isAuthenticated} />} />
            <Route path="/profile" element={<UserProfile isAuthenticated={isAuthenticated} />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
