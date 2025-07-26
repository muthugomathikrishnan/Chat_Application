const express = require('express');
const multer = require('multer');
const pool = require('../config/db'); // Ensure your database connection is set up
const app = express();

app.use(express.json());

// Get chat messages
exports.getChat = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const oppositeUserId = parseInt(req.params.oid, 10);

  try {
    const result = await pool.query(`
      SELECT message_id, sender_id, receiver_id, message_text, created_at, media, media_type
      FROM Messages
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `, [userId, oppositeUserId]);

    const messages = result.rows.map((message) => {
      if (message.media) {
        message.media = message.media.toString('base64');
      }
      return message;
    });

    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, message_text, message_type } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO Messages (sender_id, receiver_id, message_text, message_type, created_at, is_read)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING message_id, created_at
    `, [
      sender_id,
      receiver_id,
      message_text || null,
      message_type || 'text',
      false
    ]);

    const newMessage = {
      message_id: result.rows[0].message_id,
      created_at: result.rows[0].created_at,
      sender_id,
      receiver_id,
      message_text,
      message_type,
    };

    res.json({ messageDetails: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.sendMedia = async (req, res) => {
  const { sender_id, receiver_id, message_type } = req.body;
  
  // Assuming the media file is being uploaded using multer or similar middleware
  const mediaFile = req.file; // Access the uploaded file

  try {
    // You can implement your own logic to handle file storage
    // For example, save the file to a specific directory and get the file path
    const media_url = `/uploads/${mediaFile.filename}`; // Adjust this according to your file storage logic

    // Insert the message into the database
    const result = await pool.query(`
      INSERT INTO Messages (sender_id, receiver_id, message_text, message_type, media_url, created_at, is_read)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING message_id, created_at
    `, [
      sender_id,
      receiver_id,
      null, // No message text for media messages
      message_type || 'file',
      media_url,
      false
    ]);

    const newMessage = {
      message_id: result.rows[0].message_id,
      created_at: result.rows[0].created_at,
      sender_id,
      receiver_id,
      message_text: null, // No message text for media messages
      message_type: 'file',
      media_url,
    };

    res.json({ messageDetails: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending media' });
  }
};
const path = require('path');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure the directory exists and is writable
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a timestamp to avoid filename conflicts
  }
});

const upload = multer({ storage });

// Middleware for handling media uploads
app.post('/api/chat/sendMedia', upload.single('media_file'), async (req, res) => {
  const { sender_id, receiver_id, message_type = 'file' } = req.body;
  
  // Check if the file was uploaded
  const mediaFile = req.file;
  if (!mediaFile) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Get the URL of the uploaded file (assuming it's stored in 'uploads' folder)
    const media_url = `/uploads/${mediaFile.filename}`;

    // Insert the message with media into the database
    const result = await pool.query(`
      INSERT INTO Messages (sender_id, receiver_id, message_text, message_type, media_url, created_at, is_read)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING message_id, created_at
    `, [
      sender_id,
      receiver_id,
      null, // No message text for media messages
      message_type,
      media_url,
      false // is_read defaults to false
    ]);

    // Respond with the new message details
    const newMessage = {
      message_id: result.rows[0].message_id,
      created_at: result.rows[0].created_at,
      sender_id,
      receiver_id,
      message_text: null, // No message text for media messages
      message_type,
      media_url,
    };

    res.json({ messageDetails: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending media' });
  }
});
