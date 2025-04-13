const express = require('express');
const router = express.Router();
const slideCtrl = require('../app/controllers/SlideController');
const { uploadSlide, uploadSlideMobile } = require('../config/cloudinary');

router.get('/', slideCtrl.index);
router.post('/', uploadSlide.single('image'), slideCtrl.store);
router.put('/:id', uploadSlide.single('image'), slideCtrl.update);
router.delete('/:id', slideCtrl.destroy);

// Slide Mobile
router.post('/mobile', uploadSlideMobile.single('image'), slideCtrl.store);
module.exports = router;