import React, { useEffect, useState } from 'react';
import './Chat.css'; // Import your CSS file for styles

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for fetching messages
  const [sending, setSending] = useState(false); // Loading state for sending messages
  const [opUserData, setOpUserData] = useState(null); // To store the opponent's user data

  const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const user = getUserData(); // Get current user data

  useEffect(() => {
    // Fetch opponent's user data from localStorage
    const storedUserData = localStorage.getItem('op_userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setOpUserData(parsedData);
    }
  }, []);

  // Use Effect to fetch chat messages when user or opUserData is present
  useEffect(() => {
    const fetchMessages = async () => {
      if (user && opUserData && opUserData.userId) {
        setLoading(true); // Set loading state
        try {
          console.log("Fetching messages for user", user.id, "and opponent", opUserData.userId);
          const response = await fetch(`http://10.16.49.195:5000/api/chat/${user.id}/${opUserData.userId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setMessages(data.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false); // Reset loading state 
        }
      }
    };
  
    fetchMessages();
  }, [user.id, opUserData]); // Depend on user.id and opUserData  
  // Fetch messages when user or opUserData changes

  const handleSendMessage = async () => {
    if (messageText.trim() && !sending) {
      setSending(true); // Set sending state to true
      const newMessage = {
        sender_id: user.id,
        receiver_id: opUserData.userId, // Include receiver ID from opponent data
        message_text: messageText,
        message_type: 'text',
        media_url: null, // Set media URL if applicable
      };

      try {
        const response = await fetch('http://10.16.49.195:5000/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newMessage),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { ...newMessage, message_id: data.messageDetails.message_id, created_at: data.messageDetails.created_at },
        ]);
        setMessageText(''); // Clear input after sending the message
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false); // Reset sending state
      }
    }
  };

  if (!opUserData) {
    return <p>Loading chat data...</p>; // Show loading message if opUserData is not fetched
  }

  return (
    <div className="chat-container">
      <div className="header">
      <h2 style={{ color: 'green', fontWeight: 'bold',fontSize:'25px', textAlign: 'center' }}>{opUserData.name}</h2>
      <h2 style={{ color: 'black', fontWeight: 'bold',fontSize:'25px', textAlign: 'center' }}>{opUserData.email}</h2>
 {/* Display the opponent's name */}
      </div>
      <div className="messages" id="messages">
        {loading ? (
          <p>Loading messages...</p> // Show loading message when fetching messages
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`message ${message.sender_id === user.id ? 'user' : 'opponent'}`}
            >
              <p>{message.message_text}</p>
              <small>{new Date(message.created_at).toLocaleTimeString()}</small> {/* Display time */}
            </div>
          ))
        )}
      </div>
      <div className="input-section fixed-bottom">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} disabled={sending}>Send</button> {/* Disable button if sending */}
      </div>
    </div>
  );
};

export default Chat;