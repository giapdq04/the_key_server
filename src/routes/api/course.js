const express = require('express');
const courseUserCtrl = require('../../app/controllers/api/CourseUserController');
const router = express.Router()

router.get('/all-courses', courseUserCtrl.getAllCourse)
router.get('/course-detail/:slug', courseUserCtrl.showCourseDetail)

router.get('/:slug/:userID', courseUserCtrl.getCourseUser)
router.post('/enroll', courseUserCtrl.enrollCourse)

module.exports = router;