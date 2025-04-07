const express = require('express');
const router = express.Router();
const lessonCtrl = require('../app/controllers/LessonController');
const {upload} = require("../config/multerLesson");

router.get('/courses/:courseID/sections/:sectionID/lessons/create', lessonCtrl.showCreate);
router.post('/courses/:courseID/sections/:sectionID/lessons',upload.single('csvFile') ,lessonCtrl.create);
router.delete('/courses/:courseID/lessons/:id', lessonCtrl.delete);
router.get('/courses/:courseID/lessons/:id/edit', lessonCtrl.showEdit);
router.put('/courses/:courseID/lessons/:id', upload.single('csvFile'), lessonCtrl.update);

module.exports = router;