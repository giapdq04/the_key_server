const express = require('express');
const router = express.Router();
const authUserController = require('../../app/controllers/AuthUserController');

router.post('/login', authUserController.loginWithGoogle);

module.exports = router;