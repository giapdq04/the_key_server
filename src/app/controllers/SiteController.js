
const UserService = require('../../services/UserService');
const Course = require('../models/Course')

class SiteController {

    // [GET] /
    async home(req, res) {
        try {
            const courses = await Course
                .find()
                .select('-__v -createdAt -updatedAt -deleted -description')
                .lean()

            const activeUsers = await UserService.countActiveUsers()

            res.render('home', {
                courses,
                activeUsers: activeUsers
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new SiteController;