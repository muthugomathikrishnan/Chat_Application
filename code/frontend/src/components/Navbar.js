import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

// Function to retrieve user data from localStorage
const getUserData = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const userData = getUserData(); // Fetch user data

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  // Handle logout and redirection to login page
  const handleLogout = async () => {
    const user = getUserData();

    if (user) {
      try {
        await fetch('http://localhost:5000/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }), // Send user ID to mark as inactive
        });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }

    localStorage.removeItem('token');  // Clear token
    localStorage.removeItem('user');  // Clear user data
    setIsAuthenticated(false);        // Update authentication state
    navigate('/');                    // Redirect to login page
  };

  // Handle redirect to profile page
  const handleProfileRedirect = () => {
    navigate('/profile'); // Redirect to profile page
  };

  // Handle redirect to settings page
  const handleSettingsRedirect = () => {
    navigate('/settings'); // Redirect to settings page
  };

  return (
    <nav className="navbar">
      <ul className="navbar-left">
        <li><Link to="/home" className="navbar-link">Home</Link></li>
        <li><Link to="/messages" className="navbar-link">Messages</Link></li>
        <li><Link to="/groups" className="navbar-link">Groups</Link></li>
      </ul>

      <ul className="navbar-right">
        <li>
          <button onClick={handleProfileRedirect} className="profile-button">
            Hello, {userData?.name}
          </button>
        </li>
        <li>
          <button onClick={handleSettingsRedirect} className="settings-button">
            Settings
          </button>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;