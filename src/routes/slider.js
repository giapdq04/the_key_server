const express = require('express');
const router = express.Router();
const slideCtrl = require('../app/controllers/SlideController');
const { uploadSlide } = require('../config/cloudinary');

router.get('/', slideCtrl.index);
router.post('/', uploadSlide.single('image'), slideCtrl.store);
router.put('/:id', uploadSlide.single('image'), slideCtrl.update);
router.delete('/:id', slideCtrl.destroy);

module.exports = router;