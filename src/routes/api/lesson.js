const express = require('express');
const lessonUserCtrl = require('../../app/controllers/api/LessonUserController');
const router = express.Router()

router.post('/finish-lesson', lessonUserCtrl.finishLesson)

module.exports = router;