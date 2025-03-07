
const requireLogin = (req, res, next) => {
    // Kiểm tra nếu user không tồn tại trong session
    if (!req.session.user) {
        // Lưu địa chỉ URL mà người dùng đang cố truy cập để redirect sau khi đăng nhập
        req.session.returnTo = req.originalUrl;
        // Chuyển hướng người dùng đến trang đăng nhập
        return res.redirect('/auth/login');
    }
    next();
}

module.exports = {
    requireLogin
}