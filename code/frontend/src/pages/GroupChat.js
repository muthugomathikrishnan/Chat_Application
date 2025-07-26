import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css'; // Import your CSS file for styles
import axios from 'axios';
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState(''); /*{/** }//const [loading, setLoading] = useState(false);*/
  const [media, setMedia] = useState(null);
  
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [popupMedia, setPopupMedia] = useState(null);
  const [sending, setSending] = useState(false);
  
  const navigate = useNavigate(); 
  const [file, setFile] = useState(null);
 
  const groupId = localStorage.getItem('groupId');
  const groupName = localStorage.getItem('groupName'); // Get group ID from local storage
  const userId = JSON.parse(localStorage.getItem('user')).id; // Get the logged-in user's ID
  useEffect(() => {
   // console.log("Fetching messages for userId:", userId, "and groupId:", groupId);
  
    const fetchMessages = async () => {
      if (userId && groupId) {
        try {
          const response = await fetch(`http://10.16.49.195:5000/api/getGroupChat/${userId}/${groupId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setMessages(data.messages || []); // Use an empty array as fallback if no messages
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };
    fetchMessages();

    // Set up interval to fetch messages every 2 seconds
    const intervalId = setInterval(() => {
      fetchMessages();
    }, 2000);
  }, [userId,groupId]);

  const isBase64 = (str) => {
    const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|bmp|webp);base64,/;
    return base64Pattern.test(str);
  };
  const handleSendMessage = async () => {
    if (messageText.trim()) {
      const newMessage = {
        sender_id: userId, // Use logged-in user's ID
        group_id: groupId,  // Send the group ID
        message_text: messageText,
        message_type: 'text', // Set the message type
        media_url: null, // Set media URL if applicable
      };
  
      try {
        // Send the message to the backend
        const response = await fetch('http://10.16.49.195:5000/api/getGroupChat/send', {
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
        //console.log(data.messageDetails);
        // Update messages state with the sent message details from the server
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            ...newMessage, 
            message_id: data.messageDetails.message_id, 
            created_at: data.messageDetails.created_at,
            sender_name: 'Me' // You can modify this to fetch the user's name if needed
          },
        ]);
        setMessageText('');
   
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  const handleUserClick = (userId, name) => {
    // Create an object with user data
    const userData = { userId, name};
  
    // Store the object as a JSON string in localStorage
    localStorage.setItem('op_userData', JSON.stringify(userData));
  
    // Navigate to the chat page without passing the userId in the URL
    navigate('/chat');
  };
  const handleDetails = () => {
    navigate(`/groupDetails?groupId=${groupId}&userId=${userId}`);
  };


  
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
    const selectedFile = e.target.files[0];  // Get the selected file
  
    if (!selectedFile) return;  // If no file is selected, exit early
    const fileType = getFileType(selectedFile);
    console.log(`File type is: ${fileType}`);
  
    // Update the media state with the selected file
    setFile(selectedFile);
  
    const formData = new FormData();
  formData.append('sender_id', userId); // Include sender ID
  formData.append('group_id', groupId); // Include receiver ID
  formData.append('media_file', selectedFile); // Correctly append the selected file to FormData
  
    formData.append('file_type', fileType); 

  try {
    // Perform the media upload request
    const response = await axios.post('http://10.16.49.195:5000/upload_Media_Group', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads
      },
    });
  
      // Assuming the server returns the uploaded media URL or ID
      if (response.data && response.data.id) {
        // You can store or display the uploaded image as needed.
        setMedia(response.data.id); // Store media ID or URL if required
        console.log('Media uploaded successfully:', response.data);
      } else {
        throw new Error('Upload failed: No response data');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };
  
  const handleMediaClick = (media) => {
    setPopupMedia(media); // Set the selected media to display in the popup
    setPopupVisible(true); // Show the popup
  };


  return (
    <div className="chat-container">
       
      <div className="header">
        <button onClick={()=> handleDetails() } style={{ color: 'green', fontWeight: 'bold',fontSize:'25px', textAlign: 'center' }}>{groupName}</button>
      
      </div>
      <div className="messages" id="messages">
  {messages.map((message) => (
    <div
      key={message.message_id}
      className={`message ${message.sender_id === userId ? 'user' : 'opponent'}`}
    >
      {/* Display sender's name */}
      <p style={{ color: '#007BFF', cursor: 'pointer' }} onClick={() => handleUserClick(message.sender_id, message.sender_name)}>
        {message.sender_name}
      </p>

      {/* Display message text */}
      <p style={{ fontSize: '1.2em' }}>{message.message_text}</p>

      {/* If message contains media (image or other media), display it */}
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
                  <a href={"data:application/pdf;base64," + message.media} target="_blank" rel="noopener noreferrer">
                    <button style={{ cursor: 'pointer', }}>View PDF</button>
                  </a>
                )}
      {/* Display message timestamp */}
      <small>{new Date(message.created_at).toLocaleTimeString()}</small>
    </div>
  ))}
</div>

      <div className="input-section">
        <input
        type="text"
        placeholder="Type your message"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />
      <input type="file" onChange={handleMediaChange} />
      <button onClick={handleSendMessage} disabled={sending}>
        {sending ? 'Sending...' : 'Send'}
      </button>
      </div>
      
    </div>
  );
};

export default Chat;
