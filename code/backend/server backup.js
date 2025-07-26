// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');
const http = require('http');


const app = express();
app.use(cors({
  origin: true, // Allows all origins
  methods: ["GET", "POST"]
}));
app.use(express.json());


const server = http.createServer(app);


// Use auth routes
/*app.get('/api/messages/chat-users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  console.log(userId);
});
*/
// In your Node.js backend (e.g., Express)
app.get('/chat-users', async (req, res) => {

  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $1 OR id::text ILIKE $1',
      [`%${search}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching chat users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/create_group', async (req, res) => {
  const { name, description, userId } = req.body; // Assuming userId is sent in the request body
  console.log(name, description, userId);
  
  try {
      // Insert the new group
      const result = await db.query(
          'INSERT INTO groups (group_name, group_description) VALUES ($1, $2) RETURNING *',
          [name, description]
      );

      const newGroup = result.rows[0];

      // Insert the user into GroupMembers as an admin
      await db.query(
          'INSERT INTO GroupMembers (user_id, group_id, is_admin) VALUES ($1, $2, $3)',
          [userId, newGroup.group_id, true] // Assuming group_id is returned from the group insert
      );

      // Respond with the created group
      res.status(201).json(newGroup); 
  } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Error creating group' });
  }
});
app.post('/join_group', async (req, res) => {
  const { code,userId } = req.body; 
  
  try {
    // First, check if the group code is valid
    const groupResult = await db.query(
        'SELECT group_id FROM groups WHERE code = $1',
        [code] // Assuming 'code' is the group code passed in the request
    );

    if (groupResult.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
    }

    const groupId = groupResult.rows[0].group_id;

    // Insert the user into GroupMembers
    await db.query(
        'INSERT INTO GroupMembers (user_id, group_id, is_admin) VALUES ($1, $2, $3)',
        [userId, groupId, false] // Assuming the user is not an admin when joining
    );

    // Respond with a success message
    res.status(200).json({ message: 'Joined group successfully!' });
} catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error joining group' });
}

});
app.put('/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { 
      password, // Optional: if you want to update the password
      profile_image, // For students
      year_of_study, // For students
      office_location, // For staff
      contact_hours // For staff
  } = req.body;

  try {
      // Get the current user and role
      const userQuery = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userQuery.rows[0];

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const role = user.role;

      // Update user details based on role
      if (role === 'student') {
        

          await db.query(
              `UPDATE students SET year_of_study = $1 WHERE user_id = $2`,
              [year_of_study, userId]
          );
      } else if (role === 'staff') {
          

          await db.query(
              `UPDATE staff SET office_location = $1, contact_hours = $2 WHERE user_id = $3`,
              [office_location, contact_hours, userId]
          );
      }

      // Fetch the updated user details to return
      const updatedUserQuery = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const updatedUser = updatedUserQuery.rows[0];
      
      let additionalInfo;
      if (role === 'student') {
          additionalInfo = await db.query('SELECT * FROM students WHERE user_id = $1', [userId]);
      } else if (role === 'staff') {
          additionalInfo = await db.query('SELECT * FROM staff WHERE user_id = $1', [userId]);
      }

      res.json({ user: updatedUser, additionalInfo: additionalInfo.rows });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
});
app.get('/user/:id', async (req, res) => {
  console.log("hjbj");
  const userId = req.params.id;
  try {
      const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      
      if (user.rows.length === 0) {
          return res.status(404).send('User not found');
      }

      const role = user.rows[0].role;
      let additionalInfo = [];

      if (role === 'student') {
          additionalInfo = await db.query('SELECT * FROM students WHERE user_id = $1', [userId]);
      } else if (role === 'staff') {
          additionalInfo = await db.query('SELECT * FROM staff WHERE user_id = $1', [userId]);
      }

      res.json({ user: user.rows[0], additionalInfo: additionalInfo.rows });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
  }
});


app.use(express.static('public'));

app.use('/api', authRoutes);// Use user routes

app.get('/', (req, res) => {
  res.send('API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
