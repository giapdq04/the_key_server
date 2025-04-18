const User = require("../app/models/User");

class UserService {

    async countActiveUsers() {
        try {
            const activeCount = await User.countDocuments({ status: 'active' });
            return activeCount;
        } catch (error) {
            console.error('Error counting active users:', error);
            return 0;
        }
    }
}

module.exports = new UserService();