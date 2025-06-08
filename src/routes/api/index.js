const express = require('express');
const router = express.Router();

const authRouter = require('./auth')
const courseRouter = require('./course')
const userRouter = require('./user')
const lessonRouter = require('./lesson')
const slideRouter = require('./slide')
const orderRouter = require('./order')

router.use('/auth', authRouter)
router.use('/course', courseRouter)
router.use('/user', userRouter)
router.use('/lesson', lessonRouter)
router.use('/slide', slideRouter)
router.use('/order', orderRouter)

module.exports = router;