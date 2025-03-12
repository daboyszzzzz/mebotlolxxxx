// middleware/auth.js
module.exports = function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next(); // The user is logged in; continue to the requested route.
    }
    // The user is not logged in; redirect to the login page.
    res.redirect('/login.html');
  };
  