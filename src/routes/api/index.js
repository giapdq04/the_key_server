const express = require('express');
const router = express.Router();

const authRouter = require('./auth')
const courseRouter = require('./course')
const userRouter = require('./user')
const lessonRouter = require('./lesson')

router.use('/auth', authRouter)
router.use('/course', courseRouter)
router.use('/user', userRouter)
router.use('/lesson', lessonRouter)

module.exports = router;