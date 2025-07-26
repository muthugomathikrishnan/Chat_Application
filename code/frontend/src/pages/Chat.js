import React, { useEffect, useState, useRef } from 'react';
import './Chat.css';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [opUserData, setOpUserData] = useState(null);
  const [media, setMedia] = useState(null);
  const messagesEndRef = useRef(null);
  const [file, setFile] = useState(null);

  // State for popup
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMedia, setPopupMedia] = useState(null);

  const getUserData = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const user = getUserData();

  useEffect(() => {
    const storedUserData = localStorage.getItem('op_userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setOpUserData(parsedData);
    }
  }, []);

  useEffect(() => {
    if (user && opUserData && opUserData.userId) {
      setLoading(true);
      const fetchMessages = async () => {
        try {
          const response = await fetch(`http://10.16.49.195:5000/api/chat/${user.id}/${opUserData.userId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setMessages(data.messages || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false);
        }
      };

      const intervalId = setInterval(() => {
        fetchMessages();
      }, 2000);

      return () => clearInterval(intervalId);
    }
  }, [user, opUserData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
function getFileType(file) {
  const mimeType = file.type || ''; // MIME type (e.g., image/png)
  const fileName = file.name || ''; // File name (e.g., Screenshot from 2024-11-29 10-30-31.png)

  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'pdf';
  } else if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return 'document';
  } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'image';
  } else {
    return 'unknown';
  }
}
function getFileType(file) {
  const mimeType = file.type || ''; // MIME type (e.g., image/png)
  const fileName = file.name || ''; // File name (e.g., Screenshot from 2024-11-29 10-30-31.png)

  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'pdf';
  } else if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.doc') ||
    fileName.endsWith('.docx')
  ) {
    return 'document';
  } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    return 'image';
  } else {
    return 'unknown';
  }
}

  const handleMediaChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const fileType = getFileType(selectedFile);
    console.log(`File type is: ${fileType}`);
  
    setFile(selectedFile);

    const formData = new FormData();
    formData.append('sender_id', user.id);
    formData.append('receiver_id', opUserData.userId);
    formData.append('media_file', selectedFile);
    formData.append('file_type', fileType); 

    try {
      const response = await axios.post('http://10.16.49.195:5000/upload_Media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.id) {
        setMedia(response.data.id); 
        console.log('Media uploaded successfully:', response.data);
      } else {
        throw new Error('Upload failed: No response data');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      console.log('Message text is empty');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('http://10.16.49.195:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: opUserData.userId,
          message_text: messageText,
          message_type: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessage = { ...data.messageDetails, message_text: messageText, message_type: 'text' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleMediaClick = (media) => {
    setPopupMedia(media); // Set the selected media to display in the popup
    setPopupVisible(true); // Show the popup
  };

  const closePopup = () => {
    setPopupMedia(null); // Clear the selected media
    setPopupVisible(false); // Hide the popup
  };

  const groupMessagesByDay = (messages) => {
    const groupedMessages = [];
    let currentDay = null;
    let currentGroup = [];

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at);
      const messageDay = messageDate.toDateString();

      if (messageDay !== currentDay) {
        if (currentGroup.length > 0) {
          groupedMessages.push({ day: currentDay, messages: currentGroup });
        }
        currentGroup = [message];
        currentDay = messageDay;
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groupedMessages.push({ day: currentDay, messages: currentGroup });
    }

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDay(messages);

  return (
    <div className="chat-container">
      <div className="header">
        <h2>{opUserData?.name}</h2>
        <h3>{opUserData?.email}</h3>
      </div>

      <div className="messages" id="messages">
        {groupedMessages.map((group, index) => (
          <div key={index}>
            <div className="date-separator">{group.day}</div>
            {group.messages.map((message) => (
              <div key={message.message_id} className={`message ${message.sender_id === user.id ? 'user' : 'opponent'}`}>
                <p>{message.message_text}</p>
                {message.media && message.media_type === 'image' && (
                  <img
                    src={"data:image/png;base64," + message.media}
                    alt=""
                    onClick={() => handleMediaClick(message.media)} // Open popup on click
                    style={{ maxWidth: '300px', cursor: 'pointer' }}
                  />
                )}

                {message.media && message.media_type === 'video' && (
                  <video
                    src={"data:video/mp4;base64," + message.media}
                    controls // Adds playback controls (play, pause, volume, etc.)
                    onClick={() => handleMediaClick(message.media)} // Open popup on click
                    style={{ maxWidth: '300px', cursor: 'pointer' }} // Adjust the styling as needed
                  >
                    Your browser does not support the video tag.
                  </video>
                )}

                {message.media && message.media_type === 'pdf' && (
                  <a href={"data:application/pdf;base64," + message.media} download={"data:application/pdf;base64," + message.media} target="_blank" rel="noopener noreferrer">
                    <button style={{ cursor: 'pointer', }}>download PDF</button>
                  </a>
                )}


                <p className="timestamp">{new Date(message.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input type="text" placeholder="Type your message" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
        <input type="file" onChange={handleMediaChange} />
        <button onClick={handleSendMessage} disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>

      {isPopupVisible && (
        <div className="popup" onClick={closePopup}>
          <div className="popup-content">
            <img src={"data:image/png;base64," + popupMedia} alt="Popup Media" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
