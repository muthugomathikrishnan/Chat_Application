const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Login function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log("logout");
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords directly (assuming plain text)
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Mark the user as active
    await pool.query('UPDATE users SET is_active = TRUE WHERE id = $1', [user.id]);

    // Generate a JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Exclude password from the user object in the response
    const { password: _, ...userData } = user;
    res.json({ token, user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout function
exports.logout = async (req, res) => {
  const { userId } = req.body;
  console.log("logout"+userId);
  try {
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = $1', [userId]);
    res.status(200).json({ message: 'User logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to logout' });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const activeUsersResult = await pool.query('SELECT id, name, email FROM users WHERE is_active = TRUE');
    res.status(200).json(activeUsersResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch active users' });
  }
};
