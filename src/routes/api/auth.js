const express = require('express');
const router = express.Router();
const authUserController = require('../../app/controllers/api/AuthUserController');

router.post('/login', authUserController.loginWithGoogle);

module.exports = router;