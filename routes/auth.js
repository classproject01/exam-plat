const express = require('express');
const authController = require('../controllers/auth');
const router =  express.Router();

//render the pages on the server
router.post('/Tlogin', authController.Tlogin);
router.post('/Slogin', authController.Slogin);

  module.exports = router;