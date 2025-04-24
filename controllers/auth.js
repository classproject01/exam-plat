const mysql = require('mysql');
//define the database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
exports.Tlogin = (req, res) =>{
    console.log(req.body);
    const { fname, lname, email, password, confirmpassword, gender, university, course, birthdate } = req.body;
    db.query('SELECT email FROM teachers WHERE email = ?', [email], (error, results) => {
        if(error){
            console.log(error);
        }
        if (results.length > 0) {
            res.render('Tlogin', {
                message: 'the email is already in use'
            })
        }else if(password !== confirmpassword){
            res.render('Tlogin', {
                message: 'the password does not match'
            })
        }
    })
    res.send('form is submitted');
}
exports.Slogin = (req, res) =>{
    console.log(req.body);
    res.send('form is submitted');
}