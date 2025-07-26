import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Messages.css'

const Messages = ({ isAuthenticated }) => {
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate(); 

  const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  useEffect(() => {
    const fetchChatUsers = async () => {
      const userData = getUserData();

      if (userData && userData.id) {
        try {
          const response = await fetch(`http://10.16.49.195:5000/api/messages/${userData.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          setChatUsers(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchChatUsers();
  }, []);

  const handleUserClick = (userId, name, email) => {
    // Create an object with user data
    const userData = { userId, name, email };
  
    // Store the object as a JSON string in localStorage
    localStorage.setItem('op_userData', JSON.stringify(userData));
  
    // Navigate to the chat page without passing the userId in the URL
    navigate('/chat');
  };
  

  return (
    <div>
      <h1>Messages Page</h1>
      {isAuthenticated ? (
        <div>
        {loading ? (
          <p>Loading chat users...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : chatUsers.length > 0 ? (
          <div className="chat-users-list">
            {chatUsers.map(user => (
              <button 
                key={user.id} 
                className="user-box" 
                onClick={() => handleUserClick(user.id,user.name,user.email)}
              >
                <div className="user-profile">
                  {/* Assuming `user.profileImage` is the URL or path to the profile image */}
                  <img 
                    src='https://t4.ftcdn.net/jpg/00/65/77/27/360_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg'
                    alt={user.name} 
                    className="profile-image" 
                  />
                </div>
                <div className="user-name">
                  {user.name}
                </div>
                <div className="user-email">
                  {user.email}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>No chat users found.</p>
        )}
      </div>
      
      ) : (
        <p>Please log in to access more features.</p>
      )}
    </div>
  );
};

export default Messages;
