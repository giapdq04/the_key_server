const bcrypt = require('bcrypt');
const Admin = require("../models/Admin");

class AuthController {
    // [GET] /login
    login(req, res) {
        res.render('login', { layout: false });
    }

    // [POST] /login
    async loginPost(req, res) {
        try {
            const { admin_name, password } = req.body;

            // Use lean() to get plain JavaScript object instead of Mongoose Document
            const user = await Admin.findOne({ admin_name: admin_name.trim() }).lean();

            if (!user) {
                return res.render('login', {
                    layout: false,
                    error: 'Tên đăng nhập hoặc mật khẩu không đúng'
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

            if (passwordMatch) {
                // Không lưu mật khẩu vào session
                const { hashedPassword, ...userWithoutPassword } = user;
                req.session.user = userWithoutPassword;

                const redirectUrl = req.session.returnTo || '/';
                delete req.session.returnTo;
                return res.redirect(redirectUrl);
            }

            res.render('login', {
                layout: false,
                error: 'Tên đăng nhập hoặc mật khẩu không đúng'
            });
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
            if (err) console.error('Lỗi khi đăng xuất:', err);
            res.redirect('/auth/login');
        });
    }

    // [POST] /register
    async register(req, res) {
        try {
            const { admin_name, password, power } = req.body;

            // Check if admin exists using exists() instead of findOne()
            const adminExists = await Admin.exists({ admin_name: admin_name.trim() });

            if (adminExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Tên này đã tồn tại'
                });
            }

            // Hash mật khẩu
            const saltRounds = parseInt(process.env.SALT_ROUNDS) || 30;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newAdmin = new Admin({
                admin_name: admin_name.trim(),
                hashedPassword,
                power
            });
            await newAdmin.save();

            res.status(201).json({
                success: true,
                message: 'Tạo tài khoản thành công'
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [GET] /admins
    async showAllAdmins(req, res) {
        try {
            // Use lean() for better performance
            const admins = await Admin.find({}).lean();
            const currentUser = req.session.user;

            const { error, success } = req.session;
            delete req.session.error;
            delete req.session.success;

            res.render('admin/admins', {
                admins, // No need for multipleMongooseObject when using lean()
                currentUser,
                error,
                success
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [GET] /admins/create
    createAdminForm(req, res) {
        res.render('admin/createAdmin');
    }

    // [POST] /admins
    async createAdmin(req, res) {
        try {
            const currentUser = req.session.user;
            const { admin_name, password, power } = req.body;

            // Parse power as integer
            const powerInt = parseInt(power, 10);

            // Validate input early
            if (powerInt < 0 || powerInt > 10 || isNaN(powerInt)) {
                return res.render('admin/createAdmin', {
                    error: 'Quyền phải nằm trong khoảng từ 0 đến 10'
                });
            }

            if (currentUser.power >= powerInt) {
                return res.render('admin/createAdmin', {
                    error: 'Bạn không có quyền thêm admin này'
                });
            }

            // Use exists() instead of findOne()
            const adminExists = await Admin.exists({ admin_name: admin_name.trim() });

            if (adminExists) {
                return res.render('admin/createAdmin', {
                    error: 'Tên này đã tồn tại'
                });
            }

            // Hash mật khẩu
            const saltRounds = parseInt(process.env.SALT_ROUNDS) || 30;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newAdmin = new Admin({
                admin_name: admin_name.trim(),
                hashedPassword,
                power: powerInt
            });

            await newAdmin.save();
            res.redirect('/admins');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [DELETE] /admins/:id
    async deleteAdmin(req, res) {
        try {
            const currentUser = req.session.user;
            const { id } = req.params;

            // Use findById with lean() and select only needed fields
            const deletedAdmin = await Admin.findById(id).select('power').lean();

            if (!deletedAdmin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin không tồn tại'
                });
            }

            if (currentUser.power >= deletedAdmin.power) {
                return res.status(401).json({
                    success: false,
                    message: 'Bạn không có quyền xóa admin này'
                });
            }

            await Admin.deleteOne({ _id: id });
            res.redirect('/admins');
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    // [PATCH] /admins/:id
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const { power } = req.body;
            const powerInt = parseInt(power, 10);
            const currentUser = req.session.user;

            // Validate input early
            if (!power || isNaN(powerInt)) {
                req.session.error = 'Quyền hạn không được để trống và phải là số';
                return res.redirect('/admins');
            }

            if (powerInt < 0 || powerInt > 10) {
                req.session.error = 'Quyền phải nằm trong khoảng từ 0 đến 10';
                return res.redirect('/admins');
            }

            if (powerInt <= currentUser.power) {
                req.session.error = 'Bạn không có quyền sửa admin này';
                return res.redirect('/admins');
            }

            // Use findByIdAndUpdate instead of findById + save
            const result = await Admin.findByIdAndUpdate(
                id,
                { power: powerInt },
                { new: true, runValidators: true }
            );

            if (!result) {
                req.session.error = 'Admin này không tồn tại';
                return res.redirect('/admins');
            }

            req.session.success = 'Cập nhật quyền thành công';
            res.redirect('/admins');
        } catch (error) {
            console.log(error);
            req.session.error = 'Đã xảy ra lỗi, vui lòng thử lại';
            res.redirect('/admins');
        }
    }
}

module.exports = new AuthController();