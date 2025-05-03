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
const db = require('../controllers/db');

router.get('/Tdashboard', isAuthenticated, (req, res) => {
  const teacher = req.user;
  db.query('SELECT * FROM exams WHERE teacher_id = ?', [teacher.id], (err, exams) => {
    if (err) {
      console.log(err);
      return res.render('Tdashboard', { teachername: teacher.prenom, exams: [] });
    }
    exams.forEach(exam => {
      exam.shareLink = `/exam/${exam.id}`;
    });
    res.render('Tdashboard', { teachername: teacher.prenom, exams: exams });
  });
});
  router.get('/examcreate', isAuthenticated, (req, res) => {
    res.render('examcreate', { user: req.user }); // Optional: use `req.user.id` to fetch user-specific info
  });
  router.get('/Sdashboard', isAuthenticated, (req, res) => {
    res.render('Sdashboard', { user: req.user }); // Optional: use `req.user.id` to fetch user-specific info
  });
  router.get('/exam/:id', (req, res) => {
    const examId = req.params.id;
  
    const db = require('../controllers/db'); // Ensure correct db import
  
    console.log(`Fetching exam with id: ${examId}`);
  
    db.query('SELECT * FROM exams WHERE id = ?', [examId], (err, results) => {
      if (err) {
        console.error('Error fetching exam:', err);
        return res.status(500).send('Server error');
      }
  
      if (results.length === 0) {
        console.log('No exam found with id:', examId);
        return res.status(404).send('Exam not found');
      }
  
      const exam = results[0];
  
      // Now get the questions related to this exam (assuming a `questions` table exists)
      db.query('SELECT * FROM questions WHERE exam_id = ?', [examId], (qErr, questions) => {
        if (qErr) {
          console.error('Error fetching questions:', qErr);
          return res.status(500).send('Server error');
        } 
  
        console.log(`Fetched ${questions.length} questions for exam id ${examId}`);
  
        res.render('exam_take', { exam, questions });
      });
    });
  });
  
  module.exports = router;