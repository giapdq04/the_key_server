const express = require('express');
const router = express.Router();
const authCtrl = require('../app/controllers/AuthController');

router.get('/', authCtrl.showAllAdmins);
router.get('/create', authCtrl.createAdminForm);
router.post('/', authCtrl.createAdmin);
router.delete('/:id', authCtrl.deleteAdmin);
router.patch('/:id', authCtrl.updateAdmin);

module.exports = router;