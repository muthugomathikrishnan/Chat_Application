const pool = require('../config/db'); // Adjust the path according to your project structure

// Search users
exports.searchUsers= async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    try {
        const result = await pool.query(`
            SELECT id, name 
            FROM users 
            WHERE name ILIKE $1
        `, [`%${query}%`]); // Using ILIKE for case-insensitive search

        res.json(result.rows);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

