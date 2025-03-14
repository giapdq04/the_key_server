const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/api/UserController');
const tokenController = require('../../app/controllers/api/TokenController');
const { authenticateToken } = require('../../middlewares/authClient.middleware');

router.get('/user-info/:id', authenticateToken, userController.getUserInfo);
router.post('/refresh-token', tokenController.refreshToken);

module.exports = router;