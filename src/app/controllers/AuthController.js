const Admin = require("../models/Admin");

class AuthController {
    // [GET] /login
    login(req, res) {
        res.render('login', { layout: false });
    }

    // [POST] /login
    loginPost(req, res) {
        // Xử lý logic đăng nhập ở đây
        const { username, password } = req.body;
        // TODO: Validate credentials
        res.redirect('/');
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