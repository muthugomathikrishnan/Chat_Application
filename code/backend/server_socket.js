const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = []; // Array to store messages

// Middleware for handling JSON requests
app.use(express.json());

// Serve the frontend (optional if you are using a separate frontend)
app.use(express.static('public'));

// Handle join chat
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('joinChat', (senderId) => {
    console.log(`${senderId} has joined the chat`);
    socket.join(senderId); // Join a room with senderId
  });

  // Handle sending a message
  socket.on('sendMessage', (messageData) => {
    console.log('Message sent:', messageData);
    
    // Broadcast the message to the receiver
    socket.to(messageData.receiverId).emit('receiveMessage', messageData);
    
    // Optionally, store the message in an in-memory array (or a database)
    messages.push(messageData);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnected');
  });
});

// Endpoint to fetch chat history
app.post('/fetchMessages', (req, res) => {
  const { senderId, receiverId } = req.body;

  // Fetch messages between sender and receiver (simple filter for this example)
  const chatMessages = messages.filter(
    (message) =>
      (message.senderId === senderId && message.receiverId === receiverId) ||
      (message.senderId === receiverId && message.receiverId === senderId)
  );

  res.json(chatMessages);
});

// Start the server
server.listen(4000, () => {
  console.log('Server is running on http://10.16.49.195:4000');
});
