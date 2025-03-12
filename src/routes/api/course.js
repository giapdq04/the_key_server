const express = require('express');
const courseUserCtrl = require('../../app/controllers/api/CourseUserController');
const router = express.Router()

router.get('/:courseID/:userID', courseUserCtrl.getCourseUser)

module.exports = router;