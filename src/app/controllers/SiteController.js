const Course = require('../models/Course')

class SiteController {

    // [GET] /
    async index(req, res) {
        const course = await Course.find()

        res.json(course)
        // res.render('home')
    }

    // [GET] /search
    search(req, res) {
        res.send('Search')
    }
}

module.exports = new SiteController;