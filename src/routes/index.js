
const siteRouter = require('./site')
const courseRouter = require('./courses')

const route = (app) => {

    app.use('/courses', courseRouter)
    app.use('/', siteRouter)
}

module.exports = route