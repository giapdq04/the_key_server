
const Course = require('../models/Course')

class SiteController {

    // [GET] /
    async index(req, res) {
        const courses = await Course.find().lean()
        res.render('home', { courses })
    }
}

module.exports = new SiteController;