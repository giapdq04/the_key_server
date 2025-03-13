const express = require('express');
const router = express.Router();
const authUserController = require('../../app/controllers/api/AuthUserController');
const { authenticateToken } = require('../../middlewares/authClient.middleware');

router.post('/login', authUserController.loginWithGoogle);
router.post('/refresh-token', authUserController.refreshToken);

module.exports = router;