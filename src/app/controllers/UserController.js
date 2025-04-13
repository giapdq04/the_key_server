const User = require("../models/User");
const EmailService = require("../../services/EmailService");

class UserController {

    async index(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 8;
            const skip = (page - 1) * limit;

            const [users, totalUsers] = await Promise.all([
                User.find()
                    .select('-__v -deleted -updatedAt')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                User.countDocuments()
            ]);

            const totalPages = Math.ceil(totalUsers / limit);

            res.render('user', { 
                users,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            });
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
                .select('_id email username')
                .lean();

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Gửi email thông báo nếu status thay đổi
            try {

                if (status === 'banned') {
                    await EmailService.sendBanNotification(updatedUser, banReason);
                } else {
                    await EmailService.sendUnbanNotification(updatedUser);
                }
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                // Không fail request chính nếu gửi email thất bại
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