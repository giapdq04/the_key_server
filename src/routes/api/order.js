const express = require('express');
const router = express.Router()
const orderCtrl = require('../../app/controllers/api/OrderController');

router.post('/create-order', orderCtrl.createOrder)
router.post('/sepay-webhook', orderCtrl.sepayCallWebhook)

module.exports = router;