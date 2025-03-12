// routes/movies.js
const express = require('express');
const path = require('path');
const ensureAuthenticated = require('../middleware/auth');
const router = express.Router();

// This route serves a movie streaming page only for logged-in users.
router.get('/movie/index.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/movie/index.html'));
});

module.exports = router;
