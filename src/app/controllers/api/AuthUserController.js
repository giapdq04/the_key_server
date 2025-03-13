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

    async getUserInfo(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }

    async refreshToken(req, res) {
        const token = req.cookies.refreshToken;
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);

            const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
            res.status(200).json({ accessToken });
        });
    };
}

module.exports = new AuthUserController();