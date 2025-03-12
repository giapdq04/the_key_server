const express = require('express');
const router = express.Router();

const authRouter = require('./auth')
const courseRouter = require('./course')

router.use('/auth', authRouter)
router.use('/course', courseRouter)

module.exports = router;