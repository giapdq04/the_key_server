const User = require("../models/User");

class UserController {

    async index(req, res) {
        try {
            const users = await User.find().select('-__v -deleted -updatedAt').sort({ createdAt: -1 }).lean();
            res.render('user', { users });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { status, banReason } = req.body;

            const updatedUser = await User
                .findByIdAndUpdate(userId, { status }, { new: true })
                .select('_id')
                .lean();
                            
            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.redirect('/users');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = new UserController();