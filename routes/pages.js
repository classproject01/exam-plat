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
    res.render('Sdashboard', { studentName: req.user.prenom }); // Pass studentName to view
  });

router.get('/exam/:id', isAuthenticated, (req, res) => {
  const examId = req.params.id;
  console.log('User in GET /exam/:id:', req.user);
  const studentName = req.user.prenom;

  const db = require('../controllers/db');

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

    db.query('SELECT * FROM questions WHERE exam_id = ?', [examId], (qErr, questions) => {
      if (qErr) {
        console.error('Error fetching questions:', qErr);
        return res.status(500).send('Server error');
      }

      console.log(`Fetched ${questions.length} questions for exam id ${examId}`);

      res.render('exam_take', { exam, questions, studentName });
    });
  });
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
  
router.get('/search-exam', isAuthenticated, (req, res) => {
  const examLink = req.query.examLink;
  if (!examLink) {
    return res.redirect('/Sdashboard');
  }
  // Extract exam id from the link, assuming format /exam/{id} or full URL containing /exam/{id}
  const examIdMatch = examLink.match(/\/exam\/(\d+)/);
  if (!examIdMatch) {
    return res.redirect('/Sdashboard');
  }
  const examId = examIdMatch[1];
  res.redirect(`/exam/${examId}`);
});

 

router.post('/submit-exam/:id', isAuthenticated, (req, res) => {
  console.log('User object:', req.user);
  const examId = req.params.id;
  const studentName = req.body.studentName;
  const answers = req.body.answers;

  if (!studentName) {
    return res.status(400).send('User information missing');
  }

  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).send('No answers submitted');
  }

  const answersJson = JSON.stringify(answers);

  const query = 'INSERT INTO student_answers (student_name, exam_id, answers) VALUES (?, ?, ?)';
  db.query(query, [studentName, examId, answersJson], (err, result) => {
    if (err) {
      console.error('Error inserting answers:', err);
      return res.status(500).send('Error saving answers');
    }
    res.redirect('/Sdashboard');
  });
});

module.exports = router;
