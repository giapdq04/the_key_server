const express = require('express');
const router = express.Router();
const lessonCtrl = require('../app/controllers/LessonController');

router.get('/courses/:courseId/sections/:sectionId/lessons/create', lessonCtrl.showCreate);
router.post('/courses/:courseId/sections/:sectionId/lessons', lessonCtrl.create);

module.exports = router;