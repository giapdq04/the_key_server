const express = require('express');
const router = express.Router();
const userController = require('../../app/controllers/api/UserController');
const { authenticateToken } = require('../../middlewares/authClient.middleware');

router.get('/user-info/:id', authenticateToken, userController.getUserInfo);

module.exports = router;