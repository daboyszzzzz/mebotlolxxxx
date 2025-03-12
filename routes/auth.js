const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db'); // MySQL connection
const router = express.Router();

// User registration route
router.post('/register', async (req, res) => {
  console.log('Received Registration Data:', req.body); // ✅ Debugging line

  const { username, email, password, regKey } = req.body; // Changed 'registrationKey' to 'regKey'

  if (!username || !email || !password || !regKey) {
    return res.status(400).json({ error: 'Missing required fields.', received: req.body });
  }

  try {
    // 🔍 Check if the registration key exists and is unused
    const [keyRows] = await db.query('SELECT * FROM registration_keys WHERE key_value = ? AND used = 0', [regKey]);

    if (keyRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or already used registration key.' });
    }

    // 🔒 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Insert new user into the database (including email)
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);

    // ✅ Mark the key as used
    await db.query('UPDATE registration_keys SET used = 1 WHERE key_value = ?', [regKey]);

    res.json({ success: true, message: 'User registered successfully!' });

  } catch (error) {
    console.error('❌ Error during registration:', error); // Log the error
    res.status(500).json({ error: 'Server error during registration.', details: error.message });
  }
});

module.exports = router;