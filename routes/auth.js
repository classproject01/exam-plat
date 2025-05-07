const express = require('express');
const authController = require('../controllers/auth');
const { isAuthenticated } = require('../middleware/auth');
const multer = require('multer');
const router =  express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/Tlogin', authController.Tlogin);
router.post('/login', authController.login);
router.post('/Tlogout', authController.Tlogout);
router.post('/Slogin', authController.Slogin);
router.post('/signin', authController.signin);
router.post('/Slogout', authController.Slogout);
router.post('/submit-exam/:examId', authController.submitExam);
// Change multer middleware to accept any file fields for debugging
router.post('/examcreate', isAuthenticated, upload.any(), authController.examcreate);

  module.exports = router;
