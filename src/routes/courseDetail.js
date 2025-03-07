const express = require('express');
const courseDetailCtrl = require('../app/controllers/CourseDetailController');
const router = express.Router();

router.get('/:slug', courseDetailCtrl.dashboard)
router.get('/:slug/lessons', courseDetailCtrl.storedLessons)

module.exports = router;