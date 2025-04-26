const express = require('express');
const router =  express.Router();
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
  router.get('/Tdashboard', (req, res) => {
    res.render('Tdashboard');
  });
  module.exports = router;