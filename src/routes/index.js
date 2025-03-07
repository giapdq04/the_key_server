const siteRouter = require('./site')
const courseRouter = require('./courses')
const authRouter = require('./auth')
const sectionRouter = require('./section')
const courseDetail = require('./courseDetail')
const lessonRouter = require('./lesson')
const { requireLogin } = require('../middlewares/auth.middleware')

const route = (app) => {
    app.use('/auth', authRouter)
    app.use('/courses', requireLogin, courseRouter)
    app.use('/', requireLogin, lessonRouter)
    app.use('/', requireLogin, sectionRouter)
    app.use('/', requireLogin, courseDetail)
    app.use('/', requireLogin, siteRouter)
}

module.exports = route