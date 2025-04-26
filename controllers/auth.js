const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    
            res.render('Tlogin', { message: 'User Registered' });
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
  
      // Success - redirect wherever you want
      res.render('/Tdashboard'); 
    });
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