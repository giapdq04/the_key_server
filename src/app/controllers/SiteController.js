const { multipleMongooseObject } = require('../../util/mongoose');
const Course = require('../models/Course')

class SiteController {

    // [GET] /
    async index(req, res) {
        const courses = await Course.find()

        console.log(multipleMongooseObject(courses));


        res.render('home', { courses: multipleMongooseObject(courses) })
    }

    // [GET] /search
    search(req, res) {
        res.send('Search')
    }
}

module.exports = new SiteController;