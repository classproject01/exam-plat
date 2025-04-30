const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
dotenv.config({path: './.env'});
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'hbs');
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