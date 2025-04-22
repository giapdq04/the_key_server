const express = require('express');
const router = express.Router();
const bankAccountCtrl = require('../app/controllers/BankAccountController');
const bankCtrl = require('../app/controllers/BankController');

//Tài khoản ngân hàng
router.get('/', bankAccountCtrl.show);
router.post('/store', bankAccountCtrl.store);
router.post('/send-otp', bankAccountCtrl.sendOTP);
router.post('/verify-otp', bankAccountCtrl.veriryOTP);

// Ngân hàng
router.post('/create-bank', bankCtrl.createBank); // Tạo ngân hàng
router.get('/bank-list', bankCtrl.getBankList); // Danh sách ngân hàng
module.exports = router;