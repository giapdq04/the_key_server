const { multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course')

class SiteController {

    // [GET] /
    async index(req, res) {
        const courses = await Course.find()
        res.render('home', { courses: multipleMongooseObject(courses) })
    }
}

module.exports = new SiteController;