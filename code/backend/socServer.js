const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS options
const io = socketIo(server, {
    cors: {
        origin: "http://10.16.49.195:3000", // Allow only this origin
        methods: ["GET", "POST"], // Allowed methods
        allowedHeaders: ["my-custom-header"], // Custom headers if any
        credentials: true // Allow credentials (cookies, authorization headers, etc.)
    }
});

// Enable CORS for all other requests (optional)
app.use(cors());

// Serve static files from the React app
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (msg) => {
        console.log('Message received: ' + msg);
        // Broadcast message to all clients
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
