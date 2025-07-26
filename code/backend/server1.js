const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const db = require('./config/db');
const http = require('http');


const bodyParser = require('body-parser');

const app = express();
const port = 5000; // You can change this to any port you prefer

// Middleware
app.use(cors());
app.use(bodyParser.json());

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
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://10.16.49.195:${port}`);
});