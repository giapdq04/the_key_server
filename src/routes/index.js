const siteRouter = require('./site')
const courseRouter = require('./courses')
const authRouter = require('./auth')
const sectionRouter = require('./section')
const courseDetail = require('./courseDetail')
const lessonRouter = require('./lesson')
const adminRouter = require('./admin')
const slideRouter = require('./slider')
const apiRouter = require('./api')
const { requireLogin } = require('../middlewares/auth.middleware')

const route = (app) => {
    app.use('/api', apiRouter)

    app.use('/auth', authRouter)
    app.use('/courses', requireLogin, courseRouter)
    app.use('/admins', requireLogin, adminRouter)
    app.use('/slides', requireLogin, slideRouter)
    app.use('/', requireLogin, lessonRouter)
    app.use('/', requireLogin, sectionRouter)
    app.use('/', requireLogin, courseDetail)
    app.use('/', requireLogin, siteRouter)
    
    // Catch-all route - phải đặt ở cuối cùng
    app.use('*', requireLogin, (req, res) => {
        res.status(404).render('404', {
            title: 'Không tìm thấy trang',
            layout: 'main'
        });
    });
}

module.exports = route