const express = require('express');
const router = express.Router();
const authCtrl = require('../app/controllers/AuthController');

router.get('/', authCtrl.showAllAdmins);
router.post('/', authCtrl.createAdmin);
router.delete('/:id', authCtrl.deleteAdmin);

module.exports = router;