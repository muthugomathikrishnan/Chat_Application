import React, { useEffect, useState } from 'react';

const Messages = ({ isAuthenticated }) => {
    const getUserData = () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null; // Parse and return user data if it exists
      };
    
      const userData = getUserData(); // Retrieve user data
    
      console.log(userData);
    
       
      return (
        <div>
          <h1>Welcome to Home Page</h1>
          {isAuthenticated ? (
            <div>
              <p>You are logged in!</p>
              {userData ? (
                <div>
                  <h2>User Details:</h2>
                  <ul>
                    <li><strong>Email:</strong> {userData.email}</li>
                    <li><strong>Name:</strong> {userData.name}</li>
                    <li><strong>id:</strong> {userData.id}</li>
                    {/* Add other user data fields as necessary */}
                  </ul>
                </div>
              ) : (
                <p>No user data found.</p>
              )}
            </div>
          ) : (
            <p>Please log in to access more features.</p>
          )}
        </div>
      );
    };

export default Messages;
