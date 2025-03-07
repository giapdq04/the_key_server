const siteRouter = require('./site')
const courseRouter = require('./courses')
const authRouter = require('./auth')
const sectionRouter = require('./section')
const courseDetail = require('./courseDetail')
const lessonRouter = require('./lesson')

const route = (app) => {
    app.use('/auth', authRouter)
    app.use('/courses', courseRouter)
    app.use('/', lessonRouter)
    app.use('/', sectionRouter)
    app.use('/', courseDetail)
    app.use('/', siteRouter)
}

module.exports = route