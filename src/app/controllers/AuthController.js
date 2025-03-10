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
                admin_name: formData.admin_name.trim(),
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

            // Get any error or success messages from the session
            const error = req.session.error;
            const success = req.session.success;

            // Clear the messages after using them
            delete req.session.error;
            delete req.session.success;

            res.render('admin/admins', {
                admins: multipleMongooseObject(admins),
                currentUser: currentUser,
                error: error,
                success: success
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            })
        }
    }

    // [GET] /admins/create
    createAdminForm(req, res) {
        res.render('admin/createAdmin')
    }

    // [Add] /admins
    async createAdmin(req, res) {
        try {
            const currentUser = req.session.user
            const { admin_name, password, power } = req.body

            const result = await Admin.findOne({ admin_name })

            if (result) {
                // Trả về lỗi nếu admin_name đã tồn tại
                return res.render('admin/createAdmin', {
                    error: 'Tên này đã tồn tại'
                })
            }

            // Kiểm tra quyền của admin hiện tại
            if (currentUser.power >= power) {
                return res.render('admin/createAdmin', {
                    error: 'Bạn không có quyền thêm admin này'
                })
            }

            if (power < 0 || power > 10) {
                return res.render('admin/createAdmin', {
                    error: 'Quyền phải nằm trong khoảng từ 0 đến 10'
                })
            }

            const newAdmin = new Admin({
                admin_name: admin_name.trim(),
                password: password,
                power: power
            })

            await newAdmin.save()
            res.redirect('/admins')
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

    // [PATCH] /admins
    async updateAdmin(req, res) {
        try {
            const { id } = req.params
            const updatedAdmin = await Admin.findById(id)

            if (!updatedAdmin) {
                req.session.error = 'Admin này không tồn tại';
                return res.redirect('/admins');
            }

            const { power } = req.body

            if (!power) {
                req.session.error = 'Quyền hạn không được để trống';
                return res.redirect('/admins');
            }

            const currentUser = req.session.user

            if (power <= currentUser.power) {
                req.session.error = 'Bạn không có quyền sửa admin này';
                return res.redirect('/admins');
            }

            if (power < 0 || power > 10) {
                req.session.error = 'Quyền phải nằm trong khoảng từ 0 đến 10';
                return res.redirect('/admins');
            }

            updatedAdmin.power = power

            await updatedAdmin.save()

            req.session.success = 'Cập nhật quyền thành công';
            res.redirect('/admins')
        } catch (error) {
            console.log(error);
            req.session.error = 'Đã xảy ra lỗi, vui lòng thử lại';
            res.redirect('/admins');
        }
    }
}

module.exports = new AuthController();