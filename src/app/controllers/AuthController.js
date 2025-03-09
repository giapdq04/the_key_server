const { multipleMongooseObject, mongooseToObject } = require("../../util/mongoose");
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
                // Chuyển hướng người dùng đến trang mà họ đã cố truy cập trước đó
                const redirectUrl = req.session.returnTo || '/';
                delete req.session.returnTo; // Xóa đường dẫn đã lưu
                res.redirect(redirectUrl);
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

    // [GET] /logout
    logoutAdmin(req, res) {
        req.session.destroy(err => {
            if (err) {
                console.error('Lỗi khi đăng xuất:', err);
            }
            res.redirect('/auth/login');
        });
    }

    async register(req, res) {
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

    // Admin

    // [GET] /admins
    async showAllAdmins(req, res) {
        try {
            const admins = await Admin.find({})

            const currentUser = req.session.user

            res.render('admin/admins', {
                admins: multipleMongooseObject(admins),
                currentUser: currentUser
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
        }
    }

    // [Add] /admins
    async createAdmin(req, res) {
        try {
            const currentUser = req.session.user
            const { admin_name, password, power } = req.body

            const result = await Admin.findOne({ admin_name })

            if (result) {
                // Trả về lỗi nếu admin_name đã tồn tại
                return res.status(409).json({
                    success: false,
                    message: 'Tên này đã tồn tại'
                })
            }

            if (currentUser.power >= power) {
                return res.status(401).json({
                    success: false,
                    message: 'Bạn không có quyền thêm admin này'
                })
            }

            const newAdmin = new Admin({ admin_name, password, power })

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

    // [DELETE] /admins
    async deleteAdmin(req, res) {
        try {
            const currentUser = req.session.user
            const { id } = req.params

            const deteledAdmin = await Admin.findById(id)

            if (!deteledAdmin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin không tồn tại'
                })
            }

            if (currentUser.power >= deteledAdmin.power) {
                return res.status(401).json({
                    success: false,
                    message: 'Bạn không có quyền xóa admin này'
                })
            }

            await Admin.deleteOne({ _id: id })
            res.redirect('/admins')

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