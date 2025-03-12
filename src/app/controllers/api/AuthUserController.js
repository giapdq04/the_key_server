const User = require("../../models/User");

class AuthUserController {
    async loginWithGoogle(req, res) {
        const { username, avatar, email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            await User.create({ username, avatar, email })
            return res.status(201).json({ message: "User created" });
        }

        return res.status(200).json({ message: "Login successful" });
    }
}

module.exports = new AuthUserController();