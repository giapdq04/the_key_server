const User = require("../app/models/User");

class UserService {

    async countActiveUsers() {
        try {
            return await User.countDocuments({status: 'active'});
        } catch (error) {
            console.error('Error counting active users:', error);
            return 0;
        }
    }
}

module.exports = new UserService();