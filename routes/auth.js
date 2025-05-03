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
router.post('/examcreate', isAuthenticated, upload.array('media'), authController.examcreate);

  module.exports = router;
