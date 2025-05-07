const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
dotenv.config({path: './.env'});
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Serve uploads directory as static to serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
const hbs = require('hbs');

app.set('view engine', 'hbs');

// Register Handlebars helpers
hbs.registerHelper('inc', function(value) {
  return parseInt(value) + 1;
});

hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

hbs.registerHelper('endsWith', function(str, suffix) {
  if (typeof str !== 'string' || typeof suffix !== 'string') {
    return false;
  }
  return str.endsWith(suffix);
});

// Register 'or' helper for logical OR operation
hbs.registerHelper('or', function() {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.some(Boolean);
});

// Register helper to fix backslashes in paths to forward slashes
hbs.registerHelper('fixPath', function(path) {
  if (typeof path !== 'string') return path;
  return path.replace(/\\/g, '/');
});
//define the database
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});
//error 
db.connect((error) => {
if(error){
    console.log(error);
}else{
    console.log('mysql connected');
}
});
//to use the pages from pages.js
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));
//start the server on port 5000
app.listen(5000, ()=>{console.log("server started on port 5000")});
