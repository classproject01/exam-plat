const express = require('express');
const authController = require('../controllers/auth');
const router =  express.Router();

//render the pages on the server
router.post('/Tlogin', authController.Tlogin);
router.post('/login', authController.login);
router.post('/Tlogout', authController.Tlogout);
router.post('/Slogin', authController.Slogin);
router.post('/signin', authController.signin);

  module.exports = router;