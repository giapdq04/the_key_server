const express = require('express');
const router = express.Router();

const authRouter = require('./auth')
const courseRouter = require('./course')
const userRouter = require('./user')

router.use('/auth', authRouter)
router.use('/course', courseRouter)
router.use('/user', userRouter)

module.exports = router;