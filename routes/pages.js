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
const { db } = require('../controllers/auth');

router.get('/Tdashboard', isAuthenticated, (req, res) => {
  const teacher = req.user;
  db.query('SELECT * FROM exams WHERE teacher_id = ?', [teacher.id], (err, exams) => {
    if (err) {
      console.log(err);
      return res.render('Tdashboard', { teachername: teacher.prenom, exams: [] });
    }
    res.render('Tdashboard', { teachername: teacher.prenom, exams: exams });
  });
});
  router.get('/examcreate', isAuthenticated, (req, res) => {
    res.render('examcreate', { user: req.user }); // Optional: use `req.user.id` to fetch user-specific info
  });
  router.get('/Sdashboard', isAuthenticated, (req, res) => {
    res.render('Sdashboard', { user: req.user }); // Optional: use `req.user.id` to fetch user-specific info
  });
  module.exports = router;