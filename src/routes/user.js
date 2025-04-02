const express = require('express');
const router = express.Router();
const userCtrl = require('../app/controllers/UserController');

router.get('/', userCtrl.index);
router.patch('/:userId', userCtrl.updateUserStatus);

module.exports = router;