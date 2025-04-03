const express = require('express');
const router = express.Router();
const authController = require('../app/controllers/AuthController');

router.get('/login', authController.login);
router.post('/login', authController.loginPost);
router.post('/register', authController.register);
router.get('/logout', authController.logoutAdmin);

module.exports = router;