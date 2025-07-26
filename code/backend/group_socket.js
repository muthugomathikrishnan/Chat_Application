const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware to parse JSON and form-data
app.use(express.json());

// Static file serving (for images or media)
app.use('/uploads', express.static('uploads'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique file names
  }
});

const upload = multer({ storage: storage });

// Store group chat messages temporarily
let messages = [];

// To keep track of group members
let groupMembers = {};

// Set up Socket.io to manage group chat
io.on('connection', (socket) => {
  console.log('A user connected: ', socket.id);

  // Handle joining a group
  socket.on('joinGroup', (groupId, userId) => {
    console.log(`${userId} joined group ${groupId}`);
    socket.join(groupId); // User joins a room (group)
    if (!groupMembers[groupId]) groupMembers[groupId] = [];
    if (!groupMembers[groupId].includes(userId)) {
      groupMembers[groupId].push(userId);
    }
  });

  // Handle sending messages in group chat
  socket.on('sendGroupMessage', (messageData) => {
    console.log('New group message:', messageData);

    // Add the message to the chat history
    messages.push(messageData);

    // Broadcast message to all group members
    io.to(messageData.group_id).emit('receiveGroupMessage', messageData);
  });

  // Handle media file uploads for group chat
  socket.on('sendMedia', (mediaData) => {
    console.log('Media received:', mediaData);

    // Simulate uploading media and storing the media URL
    const mediaUrl = `/uploads/${mediaData.fileName}`;

    // Create message object with media details
    const mediaMessage = {
      sender_id: mediaData.sender_id,
      group_id: mediaData.group_id,
      message_text: 'Sent a media file',
      message_type: 'media',
      media_url: mediaUrl,
      created_at: new Date().toISOString(),
    };

    // Broadcast the media message to the group
    io.to(mediaData.group_id).emit('receiveGroupMessage', mediaMessage);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Endpoint to fetch group messages (for the frontend to initially load messages)
app.get('/api/getGroupChat/:userId/:groupId', (req, res) => {
  const { userId, groupId } = req.params;

  // Filter the messages for the group
  const groupMessages = messages.filter(
    (message) => message.group_id === groupId
  );

  res.json({ messages: groupMessages });
});

// Endpoint to upload media files (image, video, etc.)
app.post('/upload_Media_Group', upload.single('media_file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const fileName = req.file.filename;
  const fileUrl = `/uploads/${fileName}`;

  // Simulating media upload and returning the file URL (e.g., for display in chat)
  res.json({ id: fileName, url: fileUrl });
});

// Start the server
server.listen(5000, () => {
  console.log('Server is running on http://10.16.49.195:5000');
});
