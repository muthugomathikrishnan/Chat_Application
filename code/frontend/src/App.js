import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import GroupChat from './pages/GroupChat'; // Change to uppercase
import Channels from './pages/Channels';
import UserProfile from './pages/UserProfile';
import Chat from './pages/Chat';
import Login from './pages/Login';
import ChatGraph from './pages/ChatGraph';
import GroupDetails from './pages/GroupDetails';
import Admin from './pages/Admin';


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
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        <main>
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/home" element={<Home isAuthenticated={isAuthenticated} />} />
            <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
            <Route path="/messages" element={<Messages isAuthenticated={isAuthenticated} />} />
            <Route path="/chat" element={<Chat isAuthenticated={isAuthenticated} />} />
            <Route path="/groupchat" element={<GroupChat isAuthenticated={isAuthenticated} />} /> {/* Use uppercase */}
            <Route path="/groups" element={<Groups isAuthenticated={isAuthenticated} />} />
            <Route path="/groupDetails" element={<GroupDetails isAuthenticated={isAuthenticated} />} />
            <Route path="/channels" element={<Channels isAuthenticated={isAuthenticated} />} />
            <Route path="/graph" element={<ChatGraph isAuthenticated={isAuthenticated} />} />
            <Route path="/profile" element={<UserProfile isAuthenticated={isAuthenticated} />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
