const express = require('express');
const slideUserCtrl = require('../../app/controllers/api/SlideUserController');
const router = express.Router()

router.get('/', slideUserCtrl.getAllSlides)

module.exports = router;