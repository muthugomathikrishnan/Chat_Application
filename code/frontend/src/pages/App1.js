import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import './Home.css'; // Import your CSS file for styles
import ChatGraph from './ChatGraph'; // Ensure correct import

const Home = ({ isAuthenticated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [userFnds, setUserFnds] = useState([]); // State for user friends
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to retrieve user data from localStorage
  const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null; // Parse and return user data if it exists
  };

  const fetchUserFnds = async () => {
    const userData = getUserData();

    if (userData && userData.id) {
      try {
        const response = await fetch(`http://10.16.49.195:5000/api/getUserFnds/${userData.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Fetched user friends:', data); // Log fetched data
          setUserFnds(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFnds();
  }, []);

  useEffect(() => {
    const fetchChatUsers = async () => {
      if (searchTerm) {
        try {
          const response = await fetch(`http://10.16.49.195:5000/chat-users?search=${searchTerm}`);
          const data = await response.json();
          setChatUsers(data); // Update chat users based on search
        } catch (error) {
          console.error('Error fetching chat users:', error);
        }
      } else {
        setChatUsers([]); // Clear user list if search term is empty
      }
    };

    fetchChatUsers();
  }, [searchTerm]);

  const handleUserClick = (userId, name, email) => {
    const userData = { userId, name, email };
    localStorage.setItem('op_userData', JSON.stringify(userData)); // Store selected user's data
    navigate('/chat'); // Navigate to the Chat page
  };


  const usersfndt = [
    { id: '0', name: 'You', friends: ['1'] },
    { id: '1', name: 'Friend 1', friends: ['2', '3'] },
    { id: '2', name: 'Friend 2', friends: [] },
    { id: '3', name: 'Friend 3', friends: [] },
    // Add more users and their connections
  ];

  console.log(usersfndt);
  console.log(userFnds);

  return (
    <div className="home-container">
      <h1 className="welcome-title" style={{ color: 'red' }}>
        Welcome to Unified Communication Platform
      </h1>
      {isAuthenticated ? (
        <div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {chatUsers.length > 0 && (
              <div className="user-list">
                <h2>Chat Users:</h2>
                <ul>
                  {chatUsers.map(user => (
                    <li key={user.id}>
                      <button onClick={() => handleUserClick(user.id, user.name, user.email)}>
                        {user.name} ({user.email})
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className='chatGraph'>
            <ChatGraph users={userFnds} /> {/* Pass the fetched user friends to ChatGraph */}
          </div>
        </div>
      ) : (
        <p>Please log in to access more features.</p>
      )}
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Home;