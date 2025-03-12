const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db'); // Database connection
const router = express.Router();

// Middleware to check admin access
router.use((req, res, next) => {
  const apiKey = req.headers['authorization']; // Get API token from headers
  if (apiKey === 'YOUR_ADMIN_API_TOKEN') {  // Replace with a real secure token
    return next();
  }
  res.status(403).json({ error: 'Forbidden: You are not authorized.' });
});

// ✅ Generate and store a new registration key in the database
router.post('/generate-key', async (req, res) => {
  const newKey = uuidv4(); // Generate a unique key

  try {
    await db.query('INSERT INTO registration_keys (key_value, used) VALUES (?, 0)', [newKey]);
    res.json({ registrationKey: newKey });
  } catch (error) {
    console.error('❌ Error generating key:', error);
    res.status(500).json({ error: 'Failed to generate registration key.' });
  }
});

// ✅ Get all unused registration keys (for debugging/admin use)
router.get('/keys', async (req, res) => {
  try {
    const [keys] = await db.query('SELECT * FROM registration_keys WHERE used = 0');
    res.json(keys);
  } catch (error) {
    console.error('❌ Error fetching keys:', error);
    res.status(500).json({ error: 'Failed to fetch registration keys.' });
  }
});

// 🔍 Lookup user
router.get('/lookup-user', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter.' });
  }

  try {
    const [userRows] = await db.query('SELECT id, username, role, date_registered FROM users WHERE username = ? OR id = ?', [query, query]);
    
    if (userRows.length === 0) {
      return res.json({ error: 'User not found.' });
    }

    res.json({ user: userRows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Server error during user lookup.' });
  }
});

// 🏷️ Assign a role
router.post('/assign-role', async (req, res) => {
  const { role, userQuery } = req.body;
  
  if (!role || !userQuery) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const [userRows] = await db.query('SELECT id FROM users WHERE username = ? OR id = ?', [userQuery, userQuery]);
    
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, userRows[0].id]);
    res.json({ success: true, message: `Role ${role} assigned.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error during role assignment.' });
  }
});

// 🏗️ Create a role
router.post('/create-role', async (req, res) => {
  const { roleName, hierarchy } = req.body;
  
  if (!roleName || hierarchy == null) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const [existingRole] = await db.query('SELECT * FROM roles WHERE hierarchy = ?', [hierarchy]);
    
    if (existingRole.length > 0) {
      return res.status(409).json({ error: `Hierarchy ${hierarchy} is taken. Use another number or adjust hierarchy.` });
    }

    await db.query('INSERT INTO roles (role_name, hierarchy) VALUES (?, ?)', [roleName, hierarchy]);
    res.json({ success: true, message: `✅ Role **${roleName}** created at hierarchy ${hierarchy}.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error during role creation.' });
  }
});


module.exports = router;