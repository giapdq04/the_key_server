const siteRouter = require('./site')
const courseRouter = require('./courses')
const authRouter = require('./auth')

const route = (app) => {
    app.use('/courses', courseRouter)
    app.use('/', authRouter)
    app.use('/', siteRouter)
}

module.exports = route