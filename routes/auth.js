const express = require('express');
const authController = require('../controllers/auth');
const router =  express.Router();

router.post('/Tlogin', authController.Tlogin);
router.post('/login', authController.login);
router.post('/Tlogout', authController.Tlogout);
router.post('/Slogin', authController.Slogin);
router.post('/signin', authController.signin);
router.post('/Slogout', authController.Slogout);
router.post('/examcreate', authController.examcreate);

  module.exports = router;