// messagesController.js

const pool = require('../config/db');

exports.getChatUsers = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  console.log(userId);
  try {
    console.log(userId);
    const result = await pool.query(`
      SELECT DISTINCT 
        CASE 
          WHEN sender_id = $1 THEN receiver_id 
          ELSE sender_id 
        END AS user_id
      FROM Messages
      WHERE sender_id = $1 OR receiver_id = $1
    `, [userId]);

    const userIds = result.rows.map(row => row.user_id);

    // Fetch user details for the user IDs
    const users = await pool.query('SELECT id, name, email FROM Users WHERE id = ANY($1::int[])', [userIds]);
    //console.log(users.rows);
    
    res.json(users.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
