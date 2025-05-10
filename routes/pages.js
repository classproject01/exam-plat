const express = require('express');
const router =  express.Router();
const { isAuthenticated } = require('../middleware/auth');
const stringSimilarity = require('string-similarity');
const multer = require('multer');
const path = require('path');
const fetch = require('node-fetch');

// Configure multer storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Ensure the original file extension is preserved
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

function isAnswerClose(studentAnswer, correctAnswer, tolerance = 0.9) {
  if (!studentAnswer || !correctAnswer) return false;
  const similarity = stringSimilarity.compareTwoStrings(
    studentAnswer.trim().toLowerCase(),
    correctAnswer.trim().toLowerCase()
  );
  return similarity >= tolerance;
}

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
const util = require('util');

router.get('/Sdashboard', isAuthenticated, async (req, res) => {
  const studentName = req.user.prenom;
  const dbQuery = util.promisify(db.query).bind(db);

  try {
    // Fetch exams student took using student_name
    const exams = await dbQuery(
      `SELECT DISTINCT e.id AS exam_id, e.titre AS exam_title
       FROM exams e
       JOIN student_answers sa ON sa.exam_id = e.id
       WHERE sa.student_name = ?`,
      [studentName]
    );

    if (exams.length === 0) {
      return res.render('Sdashboard', { studentName, examResults: [] });
    }

    const examResults = [];

    for (const exam of exams) {
      try {
        const aResults = await dbQuery(
          'SELECT answers FROM student_answers WHERE exam_id = ? AND student_name = ? LIMIT 1',
          [exam.exam_id, studentName]
        );

        if (aResults.length === 0) {
          examResults.push({ examTitle: exam.exam_title, passed: false, score: 0 });
          continue;
        }

        const studentAnswers = JSON.parse(aResults[0].answers);

        const questions = await dbQuery(
          'SELECT id, correct_answer FROM questions WHERE exam_id = ?',
          [exam.exam_id]
        );

        let correctCount = 0;
        questions.forEach((q) => {
          let studentAnswer = '';
          if (Array.isArray(studentAnswers)) {
            // If answers stored as array, use index
            const index = questions.indexOf(q);
            studentAnswer = (studentAnswers[index] || '').toString().trim().toLowerCase();
          } else {
            // If answers stored as object, use question id as key
            studentAnswer = (studentAnswers[q.id.toString()] || '').toString().trim().toLowerCase();
          }
          const correctAnswer = (q.correct_answer || '').toString().trim().toLowerCase();
          const isCorrect = isAnswerClose(studentAnswer, correctAnswer, 0.8);
          console.log(`Question ID: ${q.id}, Student Answer: "${studentAnswer}", Correct Answer: "${correctAnswer}", Match: ${isCorrect}`);
          if (isCorrect) {
            correctCount++;
          }
        });

        const passThreshold = 0.5; // 50%
        const passed = (correctCount / questions.length) >= passThreshold;
        const score = Math.round((correctCount / questions.length) * 100);

        examResults.push({ examTitle: exam.exam_title, passed, score });
      } catch (innerErr) {
        console.error('Error processing exam:', innerErr);
        examResults.push({ examTitle: exam.exam_title, passed: false, score: 0 });
      }
    }

    res.render('Sdashboard', { studentName, examResults });
  } catch (err) {
    console.error('Error fetching student exams:', err);
    res.status(500).send('Server error');
  }
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

      // Log media_path for debugging
      questions.forEach(q => {
        console.log(`Question ID: ${q.id}, media_path: ${q.media_path}`);
      });

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

 

router.post('/submit-exam/:id', isAuthenticated, async (req, res) => {
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

  // Get client IP address for location
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Default location to IP if geolocation fails
  let location = ip;

  // Handle localhost IPs for local testing
  if (ip === '::1' || ip === '127.0.0.1') {
    location = 'Localhost (Development)';
  } else {
    try {
      // Call IP geolocation API
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (data.city && data.country_name) {
          location = `${data.city}, ${data.country_name}`;
        } else if (data.country_name) {
          location = data.country_name;
        }
      }
    } catch (error) {
      console.error('Error fetching geolocation:', error);
    }
  }

  const query = 'INSERT INTO student_answers (student_name, exam_id, answers, location) VALUES (?, ?, ?, ?)';
  db.query(query, [studentName, examId, answersJson, location], (err, result) => {
    if (err) {
      console.error('Error inserting answers:', err);
      return res.status(500).send('Error saving answers');
    }
    res.redirect('/Sdashboard');
  });
});
router.get('/student-list', isAuthenticated, (req, res) => {
  const examId = req.query.examId;
  if (!examId) {
    return res.status(400).send('Exam ID is required');
  }
  const query = 'SELECT DISTINCT student_name, id FROM student_answers WHERE exam_id = ?';
  db.query(query, [examId], (err, results) => {
    if (err) {
      console.error('Error fetching students:', err);
      return res.status(500).send('Server error');
    }
    res.render('student-list', { students: results, examId });
  });
});
router.get('/student-result',isAuthenticated, (req, res) => {
  res.render('student-result');
});


// Route to render exam edit form
router.get('/exam/edit/:id', isAuthenticated, (req, res) => {
  const examId = req.params.id;
  const teacher = req.user;

  db.query('SELECT * FROM exams WHERE id = ? AND teacher_id = ?', [examId, teacher.id], (err, results) => {
    if (err) {
      console.error('Error fetching exam for edit:', err);
      return res.status(500).send('Server error');
    }
    if (results.length === 0) {      return res.status(404).send('Exam not found or unauthorized');
    }
    const exam = results[0];
    res.render('examcreate', { exam, user: teacher, editMode: true });
  });
});

// Route to handle exam update
router.post('/exam/edit/:id', isAuthenticated, upload.any(), (req, res) => {
  const examId = req.params.id;
  const teacher = req.user;
  const { titre, type, duration, questions, option1, option2, option3, option4, correct } = req.body;
  const mediaFiles = req.files;

  console.log('Uploaded files:', mediaFiles);

  if (!titre || !type || !duration) {
    return res.status(400).send('Missing required fields');
  }

  const updateExamQuery = 'UPDATE exams SET titre = ?, type = ?, duration = ? WHERE id = ? AND teacher_id = ?';
  db.query(updateExamQuery, [titre, type, duration, examId, teacher.id], (err, result) => {
    if (err) {
      console.error('Error updating exam:', err);
      return res.status(500).send('Server error');
    }

    // Delete existing questions for the exam
    const deleteQuestionsQuery = 'DELETE FROM questions WHERE exam_id = ?';
    db.query(deleteQuestionsQuery, [examId], (delErr, delResult) => {
      if (delErr) {
        console.error('Error deleting old questions:', delErr);
        return res.status(500).send('Server error');
      }

      // Insert new questions
      for (let i = 0; i < questions.length; i++) {
        // Since input name is 'media[]', all files have fieldname 'media[]'
        // Assign files to questions by index
        let mediaPath = '';
        if (mediaFiles && mediaFiles.length > 0) {
          const file = mediaFiles[i];
          if (file) {
            mediaPath = '/uploads/' + file.filename;
          }
        }
        // For written type, options can be empty strings instead of null to avoid DB errors
        // Also ensure option arrays exist and have values to avoid undefined
        const questionOptions = (type === 'written') ? {
          option_1: '',
          option_2: '',
          option_3: '',
          option_4: '',
        } : {
          option_1: (option1 && option1[i]) ? option1[i] : null,
          option_2: (option2 && option2[i]) ? option2[i] : null,
          option_3: (option3 && option3[i]) ? option3[i] : null,
          option_4: (option4 && option4[i]) ? option4[i] : null,
        };
        db.query('INSERT INTO questions SET ?', {
          exam_id: examId,
          question_text: questions[i],
          ...questionOptions,
          correct_answer: correct[i] || null,
          media_path: mediaPath
        });
      }

      res.redirect('/Tdashboard');
    });
  });
});

// Route to handle exam deletion
router.post('/exam/delete/:id', isAuthenticated, (req, res) => {
  const examId = req.params.id;
  const teacher = req.user;

  const deleteQuery = 'DELETE FROM exams WHERE id = ? AND teacher_id = ?';
  db.query(deleteQuery, [examId, teacher.id], (err, result) => {
    if (err) {
      console.error('Error deleting exam:', err);
      return res.status(500).send('Server error');
    }
    res.redirect('/Tdashboard');
  });
});

  
// Route to view a student's results for a specific exam
// Route to view a student's results for a specific exam
router.get('/exam/:examId/student/:studentId/results', isAuthenticated, (req, res) => {
  const { examId, studentId } = req.params;

  const answersQuery = 'SELECT * FROM student_answers WHERE exam_id = ? AND id = ?';
  const questionsQuery = 'SELECT * FROM questions WHERE exam_id = ?';

  db.query(answersQuery, [examId, studentId], (err, answersResults) => {
    if (err) {
      console.error('Error fetching student answers:', err);
      return res.status(500).send('Server error');
    }
    if (answersResults.length === 0) {
      return res.status(404).send('Results not found');
    }

    const studentAnswers = JSON.parse(answersResults[0].answers);
    const studentName = answersResults[0].student_name;

    db.query(questionsQuery, [examId], (qErr, questionsResults) => {
      if (qErr) {
        console.error('Error fetching questions:', qErr);
        return res.status(500).send('Server error');
      }

      const results = questionsResults.map((question, index) => {
        let studentAnswer = '';

        if (Array.isArray(studentAnswers)) {
          studentAnswer = studentAnswers[index] || '';
        } else {
          studentAnswer = studentAnswers[question.id] || '';
        }

        const correct = question.correct_answer || '';
        const isCorrect = isAnswerClose(studentAnswer, correct); // ✅ fuzzy match

        return {
          question: question.question_text || question.text || `Question ${index + 1}`,
          studentAnswer,
          correct,
          isCorrect
        };
      });

      res.render('student-result', { studentName, results });
    });
  });
});


module.exports = router;
