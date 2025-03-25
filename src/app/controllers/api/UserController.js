const User = require("../../models/User");

class UserController {

    async getUserInfo(req, res) {
        try {
            const user = await User.findById(req.user.userId).select('-__v -updatedAt -deleted')
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new UserController();