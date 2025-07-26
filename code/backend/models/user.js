// models/user.js
const db = require('../config/db');
const getUserById = async (userId) => {
  const query = 'SELECT name, email, phone, profile AS "profilePicture", role FROM users WHERE id = $1';
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};

module.exports = {
  getUserById,
};
