const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Kiểm tra xem biến môi trường EMAIL_USER và EMAIL_PASS có tồn tại không
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('CẢNH BÁO: EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình. Dịch vụ gửi email sẽ không hoạt động.');
            this.emailConfigured = false;
            return;
        }

        this.emailConfigured = true;
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendBanNotification(user, reason) {
        if (!this.emailConfigured) {
            console.warn('Không thể gửi email thông báo chặn vì dịch vụ email chưa được cấu hình.');
            return false;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Thông báo tài khoản bị chặn',
                html: `
                    <h2>Xin chào ${user.username},</h2>
                    <p>Tài khoản của bạn đã bị chặn với lý do: <strong>${reason || 'Vi phạm quy định của hệ thống'}</strong>.</p>
                    <p>Nếu bạn có thắc mắc, vui lòng liên hệ với quản trị viên để được hỗ trợ.</p>
                    <p>Trân trọng,<br>The Key Team</p>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email chặn đã được gửi:', user.email);
            return result;
        } catch (error) {
            console.error('Lỗi khi gửi email chặn:', error.message);
            throw error;
        }
    }

    async sendUnbanNotification(user) {
        if (!this.emailConfigured) {
            console.warn('Không thể gửi email thông báo mở chặn vì dịch vụ email chưa được cấu hình.');
            return false;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Thông báo mở chặn tài khoản',
                html: `
                    <h2>Xin chào ${user.username},</h2>
                    <p>Tài khoản của bạn đã được mở chặn. Bạn có thể đăng nhập lại vào hệ thống ngay bây giờ.</p>
                    <p>Trân trọng,<br>The Key Team</p>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email mở chặn đã được gửi:', user.email);
            return result;
        } catch (error) {
            console.error('Lỗi khi gửi email mở chặn:', error.message);
            throw error;
        }
    }

    async sendWelcomeEmail(user) {
        if (!this.emailConfigured) {
            console.warn('Không thể gửi email chào mừng vì dịch vụ email chưa được cấu hình.');
            return false;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Chào mừng đến với The Key',
                html: `
                    <h2>Xin chào ${user.username},</h2>
                    <p>Chào mừng bạn đến với nền tảng học tập của chúng tôi!</p>
                    <p>Tài khoản của bạn đã được tạo thành công. Bạn có thể bắt đầu khám phá các khóa học ngay bây giờ.</p>
                    <p>Trân trọng,<br>The Key Team</p>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email chào mừng đã được gửi:', user.email);
            return result;
        } catch (error) {
            console.error('Lỗi khi gửi email chào mừng:', error.message);
            throw error;
        }
    }
}

module.exports = new EmailService();