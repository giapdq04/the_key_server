const express = require('express');
const courseUserCtrl = require('../../app/controllers/api/CourseUserController');
const { authenticateToken } = require('../../middlewares/authClient.middleware');
const router = express.Router()

router.get('/:courseID/:userID', courseUserCtrl.getCourseUser)
router.post('/:courseID/:userID/enroll', courseUserCtrl.enrollCourse)

router.get('/all-courses', authenticateToken, courseUserCtrl.getAllCourse)

module.exports = router;