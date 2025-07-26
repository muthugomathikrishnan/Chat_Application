const pool = require('../config/db');

// Function to get users with their friends
exports.getUserFnds = async (req, res) => {
  const userId = parseInt(req.params.id, 10); // Logged-in user ID
  //console.log("Fetching user friends for ID:", userId);
  
  try {
    const result = await pool.query(`
      SELECT 
          u.id AS id, 
          CASE WHEN u.id = $1 THEN 'You' ELSE u.name END AS name, 
          COALESCE(friends.friend_ids, '{}') AS friends
      FROM 
          Users u
      LEFT JOIN LATERAL (
          SELECT 
              ARRAY_AGG(DISTINCT CASE 
                  WHEN m.sender_id = u.id THEN m.receiver_id 
                  ELSE m.sender_id 
              END) AS friend_ids
          FROM 
              messages m
          WHERE 
              m.sender_id = u.id OR m.receiver_id = u.id
      ) AS friends ON true
      ORDER BY 
          CASE WHEN u.id = $1 THEN 0 ELSE 1 END, u.id; 
    `, [userId]);

    // Ensure the friends array is formatted correctly
    const formattedUsers = result.rows.map(user => ({
      id: user.id.toString(), // Keep the ID as a string
      name: user.name,
      friends: user.friends.filter(friendId => friendId !== null).map(id => id.toString()) // Ensure friend IDs are strings
    }));

   // console.log(formattedUsers); // For debugging
    res.json(formattedUsers); // Directly return the array of users
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
