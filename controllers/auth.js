const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const stringSimilarity = require('string-similarity');
//taux de tolérance (ex : 10%) pour erreurs de frappe ou casse
function isAnswerClose(studentAnswer, correctAnswer, tolerance = 0.1) {
  if (!studentAnswer || !correctAnswer) return false;
  const similarity = stringSimilarity.compareTwoStrings(
    studentAnswer.trim().toLowerCase(),
    correctAnswer.trim().toLowerCase()
  );
  return similarity >= tolerance;
}
 
//define the database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
//registration 
exports.Tlogin = async (req, res) =>{
    const {fname, lname, email, password, confirmpassword, gender, university, course, birthdate } = req.body;
    console.log(req.body);
    db.query('SELECT email FROM teachers WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            return res.render('Tlogin', { message: 'Database error' });
        }
    
        if (results.length > 0) {
            return res.render('Tlogin', { message: 'email exists' }); // Return stops the function
        }
    
        if (password !== confirmpassword) {
            return res.render('Tlogin', { message: 'passwords do not match' });
        }
    
        // ✅ Only now we continue with hashing and insert
        const cryptedPasswords = await bcrypt.hash(password, 8);
    
        db.query('INSERT INTO teachers SET ?', {
            prenom: fname,
            nom: lname,
            email: email,
            password: cryptedPasswords,
            sexe: gender,
            etablissement: university,
            filiere: course,
            birthdate: birthdate
        }, (error, results) => {
            if (error) {
                console.log(error);
                return res.render('Tlogin', { message: 'Insert failed' });
            }
    
            res.render('Tlogin', { message: 'User Registered. Now login please!' });
        });
    });
}
//login for the teacher page
exports.login = (req, res) => {
    const { email, password } = req.body;
  
    db.query('SELECT * FROM teachers WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.log(error);
        return res.render('Tlogin', { message: 'Database error' });
      }
  
      if (results.length == 0 || !(await bcrypt.compare(password, results[0].password))) {
        return res.render('Tlogin', { message: 'Incorrect email or password' });
      }
      const teacher = results[0];
      const token = jwt.sign({ id: teacher.id, prenom: teacher.prenom }, process.env.JWT_SECRET, {
        expiresIn: '90d'
      });
      res.cookie('jwt', token, {
        httpOnly: true,     // prevents JavaScript access
        secure: false,      // set to true if using HTTPS
        maxAge: 90 * 24 * 60 * 60 * 1000  // 90 days
      });

      // Fetch exams for the teacher
      db.query('SELECT * FROM exams WHERE teacher_id = ?', [teacher.id], (err, exams) => {
        if (err) {
          console.log(err);
          return res.render('Tdashboard', { teachername: teacher.prenom, exams: [] });
        }
        // Add shareLink property to each exam
        exams.forEach(exam => {
          exam.shareLink = `/exam/${exam.id}`;
        });
        // Success - render dashboard with exams
        res.render('Tdashboard', { teachername: teacher.prenom, exams: exams });
      });
    });
  };
 //logout for teachers
 exports.Tlogout =  (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/Tlogin');
  }; 
 //Registration for students 
exports.Slogin = async (req, res) =>{
    const {fname, lname, email, password, confirmpassword, gender, university, course, birthdate } = req.body;
    console.log(req.body);
    db.query('SELECT email FROM students WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
            return res.render('Slogin', { message: 'Database error' });
        }
    
        if (results.length > 0) {
            return res.render('Slogin', { message: 'email exists' }); // Return stops the function
        }
    
        if (password !== confirmpassword) {
            return res.render('Slogin', { message: 'passwords do not match' });
        }
    
        // ✅ Only now we continue with hashing and insert
        const cryptedPasswords = await bcrypt.hash(password, 8);

        db.query('INSERT INTO students SET ?', {
            prenom: fname,
            nom: lname,
            email: email,
            password: cryptedPasswords,
            sexe: gender,
            etablissement: university,
            filiere: course,
            birthdate: birthdate
        }, (error, results) => {
            if (error) {
                console.log(error);
                return res.render('Slogin', { message: 'Insert failed' });
            }
    
            res.render('Slogin', { message: 'User Registered' });
        });
    });
}
//login for students
exports.signin = (req, res) => {
    const { email, password } = req.body;
  
    db.query('SELECT * FROM students WHERE email = ?', [email], async (error, results) => {
      if (error) {
        console.log(error);
        return res.render('Slogin', { message: 'Database error' });
      }
  
      if (results.length == 0 || !(await bcrypt.compare(password, results[0].password))) {
        return res.render('Slogin', { message: 'Incorrect email or password' });
      }
  
      const student = results[0];
      const token = jwt.sign({ id: student.id, prenom: student.prenom }, process.env.JWT_SECRET, {
        expiresIn: '90d'
      });
      res.cookie('jwt', token, {
        httpOnly: true,     // prevents JavaScript access
        secure: false,      // set to true if using HTTPS
        maxAge: 90 * 24 * 60 * 60 * 1000  // 90 days
      });
  
      // Success - redirect wherever you want
      res.render('Sdashboard', {studentName: student.prenom}); 
    });
  };
  //logout for students
  exports.Slogout =  (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/Slogin');
  };
  //Insert the exam to database
exports.examcreate = (req, res) => {
    const { titre, duration, type, questions, option1, option2, option3, option4, correct } = req.body;
    const mediaFiles = req.files; // if using multer

    db.query('INSERT INTO exams SET ?', { titre: titre, type: type, teacher_id: req.user.id, duration: duration }, (err, examResult) => {
        if (err) { 
            console.log(err); 
            return res.send('DB error'); 
        }

        const examId = examResult.insertId;

        // Insert questions
        for (let i = 0; i < questions.length; i++) {
            db.query('INSERT INTO questions SET ?', {
                exam_id: examId,
                question_text: questions[i],
                option_1: option1[i] || null,
                option_2: option2[i] || null,
                option_3: option3[i] || null,
                option_4: option4[i] || null,
                correct_answer: correct[i] || null,
                media_path: mediaFiles[i] ? '/uploads/' + mediaFiles[i].filename : ''
            });
        }

        // generate a shareable link
        const shareLink = `localhost:5000/exam/${examId}`;

        // Redirect to Tdashboard with query params for notification and link
        res.redirect(`/Tdashboard?notification=Exam created!&link=${encodeURIComponent(shareLink)}`);
    });
}
exports.submitExam = (req, res) => {
  const examId = req.params.examId;
  const answers = JSON.stringify(req.body.answers); // Make sure answers are structured like answers[questionId]
  const studentName = req.body.studentName || 'Anonymous'; // You can pass this from a hidden input or session

  const sql = `
    INSERT INTO student_answers (student_name, exam_id, answers)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [studentName, examId, answers], (err, result) => {
    if (err) {
      console.error('Error saving answers:', err);
      return res.status(500).send('Server error');
    }
    res.send('Answers submitted successfully!');
  });
};
exports.getStudentsByExam = (req, res) => {
  const examId = req.params.examId;
  const sql = `SELECT id, student_name FROM student_answers WHERE exam_id = ?`;

  db.query(sql, [examId], (err, results) => {
    if (err) return res.status(500).send('Server error');
    res.render('students-list', { students: results, examId });
  });
};
exports.getStudentResults = (req, res) => {
  const { examId, studentId } = req.params;

  const studentSql = `SELECT * FROM student_answers WHERE id = ? AND exam_id = ?`;
  db.query(studentSql, [studentId, examId], (err, studentRows) => {
    if (err || studentRows.length === 0) return res.status(404).send('Not found');

    const studentAnswers = JSON.parse(studentRows[0].answers);

    const questionSql = `SELECT id, question_text, correct_answer FROM questions WHERE exam_id = ?`;
    db.query(questionSql, [examId], (err, questions) => {
      if (err) return res.status(500).send('Server error');

      const results = questions.map(q => {
        const studentAnswer = studentAnswers[q.id] || 'No answer';
        const isCorrect = isAnswerClose(studentAnswer, q.correct_answer); // fuzzy comparison

        return {
          question: q.question_text,
          correct: q.correct_answer,
          studentAnswer,
          isCorrect
        };
      });

      res.render('student-result', {
        studentName: studentRows[0].student_name,
        results
      });
    });
  });
};