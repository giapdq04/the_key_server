const jwt = require("jsonwebtoken");

class TokenController {
    async refreshToken(req, res) {

        const token = req.body.token;
        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);

            const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
            res.status(200).json({ accessToken });
        });
    };
}

module.exports = new TokenController();