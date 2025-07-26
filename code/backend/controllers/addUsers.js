const pool = require('../config/db'); // Assuming you're using pool for DB connection

// Function to add a single user
exports.addUser = async (req, res) => {
  const { name, email, role } = req.body;
    console.log("addUser");
    console.log(name,email,role)
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  try {
    // Insert user into the users table
    await pool.query(
      'INSERT INTO users (name, email, role,password) VALUES ($1, $2, $3,$4)', 
      [name, email, role,"1234"]
    );
    res.status(201).json({ message: 'User added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add user' });
  }
};

// Function to add multiple users
exports.addMultipleUsers = async (req, res) => {
  const { emails, role } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0 || !role) {
    return res.status(400).json({ error: 'Emails array and role are required' });
  }

  try {
    // Create a list of SQL values from the emails array
    const values = emails
      .map(email => `('${email.split('@')[0]}', '${email}', '${role}')`)
      .join(',');

    // Insert multiple users in one query
    await pool.query(
      `INSERT INTO users (name, email, role) VALUES ${values}`
    );
    res.status(201).json({ message: 'Multiple users added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add multiple users' });
  }
};
