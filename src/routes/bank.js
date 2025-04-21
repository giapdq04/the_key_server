const express = require('express');
const router = express.Router();
const bankCtrl = require('../app/controllers/BankController');

router.get('/', bankCtrl.show);
router.post('/store', bankCtrl.store);
router.post('/send-otp', bankCtrl.sendOTP);
router.post('/verify-otp', bankCtrl.veriryOTP);

module.exports = router;