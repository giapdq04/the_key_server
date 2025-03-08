const express = require('express');
const router = express.Router();
const authCtrl = require('../app/controllers/AuthController');

router.get('/', authCtrl.showAllAdmins);

module.exports = router;