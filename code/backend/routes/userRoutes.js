// routes/userRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../models/user');

const router = express.Router();

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Attach user data to request
    next();
  });
};

// Get user profile
router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from token
    const user = await getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
