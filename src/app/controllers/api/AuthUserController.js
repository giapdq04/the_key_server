const User = require("../../models/User");
const jwt = require("jsonwebtoken");

class AuthUserController {
    async loginWithGoogle(req, res) {
        const { username, avatar, email } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({ username, avatar, email });
        }

        // Tạo access token và refresh token
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        return res.status(200).json({
            message: "Login successful",
            accessToken,
            refreshToken,
            userID: user._id,
        });
    }




}

module.exports = new AuthUserController();