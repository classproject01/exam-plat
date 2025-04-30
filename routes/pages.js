const express = require('express');
const router =  express.Router();
const { isAuthenticated } = require('../middleware/auth');
//render the pages on the server
router.get('/', (req, res) => {
  res.render('index');
});
router.get('/Slogin', (req, res) => {
    res.render('Slogin');
  });
  router.get('/Tlogin', (req, res) => {
    res.render('Tlogin');
  });
  router.get('/Tdashboard', isAuthenticated, (req, res) => {
    res.render('Tdashboard', { user: req.user }); // Optional: use `req.user.id` to fetch user-specific info
  });
  module.exports = router;