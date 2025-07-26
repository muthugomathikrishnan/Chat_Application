// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');
const http = require('http');
const multer = require('multer');
const fs = require('fs');
const path = require('path');



const bodyParser = require('body-parser');


const app = express();
app.use(cors({
  origin: true, // Allows all origins
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(bodyParser.json());





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
function generateRandomCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.post('/create_group', async (req, res) => {
  const { name, description, userId } = req.body; // Assuming userId is sent in the request body
  console.log(name, description, userId);
  const randomCode = generateRandomCode(Math.floor(Math.random() * (12 - 8 + 1)) + 8); // Generate a code of 8-12 length


  try {
      // Insert the new group
      const result = await db.query(
          'INSERT INTO groups (group_name, group_description,code) VALUES ($1, $2,$3) RETURNING *',
          [name, description,randomCode]
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


app.get('/group/:groupId/isAdmin', async (req, res) => {
  const { groupId } = req.params;
  const userId = req.headers['user-id']; // Get userId from headers

  try {
      const result = await db.query(
          'SELECT is_admin FROM GroupMembers WHERE group_id = $1 AND user_id = $2',
          [groupId, userId]
      );

      if (result.rows.length > 0) {
          return res.json({ isAdmin: result.rows[0].is_admin });
      } else {
          return res.json({ isAdmin: false });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
  }
});
// Fetch group details and members with user details
app.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;

  try {
    // Fetch group details
    const groupQuery = await db.query('SELECT * FROM Groups WHERE group_id = $1', [groupId]);

    // Fetch members with user details
    const membersQuery = await db.query(`
      SELECT gm.group_member_id, gm.user_id, u.name, u.email 
      FROM GroupMembers gm 
      JOIN Users u ON gm.user_id = u.id 
      WHERE gm.group_id = $1`, [groupId]);

    if (groupQuery.rows.length > 0) {
      res.json({
        group: groupQuery.rows[0],
        members: membersQuery.rows,
      });
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});// Add member

// Add member by email
app.post('/group/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  const { email, isAdmin } = req.body; // Expecting email in the request body

  try {
    // Find user by email
    const userQuery = await db.query('SELECT id FROM Users WHERE email = $1', [email]);
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'User  not found' });
    }

    const userId = userQuery.rows[0].id;

    // Check if the user is already a member of the group
    const memberCheck = await db.query('SELECT * FROM GroupMembers WHERE user_id = $1 AND group_id = $2', [userId, groupId]);

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User  is already a member of the group' });
    }

    // Add the user to the group
    const result = await db.query(
      'INSERT INTO GroupMembers (user_id, group_id, is_admin) VALUES ($1, $2, $3) RETURNING *',
      [userId, groupId, isAdmin]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Remove member
app.delete('/group/:groupId/members/:memberId', async (req, res) => {
const { groupId, memberId } = req.params;

try {
  await db.query('DELETE FROM GroupMembers WHERE group_member_id = $1 AND group_id = $2', [memberId, groupId]);
  res.status(204).send();
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
});

app.patch('/group/:groupId/visibility', async (req, res) => {
const { groupId } = req.params;
const { isVisible } = req.body; // Expecting { isVisible: true/false }

try {
  const result = await db.query('UPDATE Groups SET visibility = $1 WHERE group_id = $2 RETURNING *', [isVisible, groupId]);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Group not found' });
  }

  res.status(200).json({ message: 'Group visibility updated', group: result.rows[0] });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
});

app.patch('/group/:groupId/adminOnlyMessages', async (req, res) => {
const { groupId } = req.params;
const { adminOnlyMessages } = req.body; // Expecting { adminOnlyMessages: true/false }

try {
  const result = await db.query('UPDATE Groups SET admin_only_messages = $1 WHERE group_id = $2 RETURNING *', [adminOnlyMessages, groupId]);
  
  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Group not found' });
  }

  res.status(200).json({ message: 'Admin-only messages setting updated', group: result.rows[0] });
} catch (error) {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
}
});




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads'; // Define your upload directory
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Handle media upload endpoint
app.post('/upload_Media', upload.single('media_file'), async (req, res) => {
  console.log("Received request to upload media");

  const { sender_id, receiver_id,file_type } = req.body; // Access the sender_id and receiver_id from req.body
  const filePath = path.join(__dirname, 'uploads', req.file.filename); // The file path to store in DB

  if (!sender_id || !receiver_id || !req.file) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Read the file into a buffer (binary data) to store in the database
  const fileBuffer = fs.readFileSync(filePath);

  try {
    // Insert the message record with the media
    const insertMessageQuery = `
      INSERT INTO Messages (sender_id, receiver_id, media,media_type)
      VALUES ($1, $2, $3,$4) RETURNING message_id;
    `;
    const values = [sender_id, receiver_id, fileBuffer,file_type];
    const result = await db.query(insertMessageQuery, values);

    // Get the inserted message ID
    const messageId = result.rows[0].message_id;

    // Clean up the uploaded file (optional)
    fs.unlinkSync(filePath);

    // Return the message ID and success response
    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully!',
      messageId: messageId,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Error uploading media to the database' });
  }
});

app.post('/upload_Media_Group', upload.single('media_file'), async (req, res) => {
  console.log("Received request to upload media");

  const { sender_id, group_id,file_type } = req.body; // Access the sender_id and receiver_id from req.body
  const filePath = path.join(__dirname, 'uploads', req.file.filename); // The file path to store in DB

  if (!sender_id || !group_id || !req.file) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Read the file into a buffer (binary data) to store in the database
  const fileBuffer = fs.readFileSync(filePath);

  try {
    // Insert the message record with the media
    const insertMessageQuery = `
      INSERT INTO Messages (sender_id, group_id, media,media_type)
      VALUES ($1, $2, $3,$4) RETURNING message_id;
    `;
    const values = [sender_id, group_id, fileBuffer,file_type];
    const result = await db.query(insertMessageQuery, values);
    console.log("Received request to upload media");

    // Get the inserted message ID
    const messageId = result.rows[0].message_id;

    // Clean up the uploaded file (optional)
    fs.unlinkSync(filePath);

    // Return the message ID and success response
    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully!',
      messageId: messageId,
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Error uploading media to the database' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
