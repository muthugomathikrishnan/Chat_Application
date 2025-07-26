  const pool = require('../config/db');

// Function to get messages in a group for a user
exports.getGroupChat = async (req, res) => {
  const userId = parseInt(req.params.id, 10);  // Logged-in user ID
  const groupId = parseInt(req.params.gid, 10);  // Group ID
  //console.log(`Fetching messages for user ID: ${userId} in group ID: ${groupId}`);

  try {
    // Fetch messages for the group
    const result = await pool.query(`
      SELECT 
        m.message_id,
        m.sender_id,
        m.group_id,
        m.created_at,
        m.message_text,
        m.message_type,
        m.media,m.media_type,
        m.is_read,
        u.name AS sender_name  -- Assuming the Users table has a 'username' column
      FROM Messages m
      JOIN users u ON m.sender_id = u.id  -- Join the Users table
      WHERE m.group_id = $1
      ORDER BY m.created_at ASC
    `, [groupId]);

    const messages = result.rows.map((message) => {
      if (message.media) {
        message.media = message.media.toString('base64');
      }
      return message;
    });
    
      //console.log(result.rows);
    // If no messages found, send an empty array
    res.json({ messages: messages });
  } catch (err) {
    console.error('Database query error:', err);  // Log the actual error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.sendGroupChat = async (req, res) => {
  const { sender_id, group_id, message_text, message_type, media_url } = req.body;
  console.log("fedc");
  

  try {
    const result = await pool.query(`
      INSERT INTO Messages (sender_id, group_id, message_text, message_type, media, created_at, is_read)
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING message_id, created_at
    `, [sender_id, group_id, message_text, message_type || null, media_url || null, false]);

    // Send back the inserted message details
    res.status(201).json({ message: 'Message sent successfully', messageDetails: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
