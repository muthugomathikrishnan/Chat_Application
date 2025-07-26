const pool = require('../config/db');

exports.getGroups = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  console.log(`Fetching groups for user ID: ${userId}`);

  try {
    const result = await pool.query(`
      SELECT *
      FROM GroupMembers gm
      JOIN Groups g ON gm.group_id = g.group_id
      WHERE gm.user_id = $1
    `, [userId]);

    const groups = result.rows;
    //console.log(`Groups found:`, groups);
    
    // Send a structured response
    res.status(200).json({ success: true, groups });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};