const Admin = require("../models/Admin");

class AuthController {
    // [GET] /login
    login(req, res) {
        res.render('login', { layout: false });
    }

    // [POST] /login
    async loginPost(req, res) {
        try {
            const formData = req.body;
            const user = await Admin.findOne({
                admin_name: formData.admin_name,
                password: formData.password
            });

            if (user) {
                req.session.user = user;
                res.redirect('/');
            } else {
                res.render('login', {
                    layout: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }
        } catch (error) {
            console.error(error);
            res.render('login', {
                layout: false,
                error: 'Đã xảy ra lỗi, vui lòng thử lại'
            });
        }
    }

    async registerPost(req, res) {
        try {
            const formData = req.body
            const result = await Admin.findOne({ admin_name: formData.admin_name })

            if (result) {
                // Trả về lỗi nếu admin_name đã tồn tại
                return res.status(409).json({
                    success: false,
                    message: 'Tên này đã tồn tại'
                })
            }

            const newAdmin = new Admin(formData)

            await newAdmin.save()
            res.status(201).json({
                success: true,
                message: 'Tạo tài khoản thành công'
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
        }
    }
}

module.exports = new AuthController();