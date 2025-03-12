// app.js
const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up session management
app.use(session({
  secret: 'thisistheyeptestkey', // Replace with a strong secret in production
  resave: false,
  saveUninitialized: false,
}));

// Serve static files (HTML, CSS, images) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Import route files
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const movieRoutes = require('./routes/movies');

// Use the routes in your application
app.use('/', authRoutes);
app.use('/api', adminRoutes);
app.use('/', movieRoutes);

// Require the Discord bot file so it starts with your app
require('./discord/bot');

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});