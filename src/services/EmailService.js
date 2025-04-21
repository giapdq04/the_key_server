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
                    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px;">
                            <h2 style="color: #d32f2f; margin-bottom: 16px;">Tài khoản bị chặn</h2>
                            <p style="font-size: 16px; color: #333;">Xin chào <strong>${user.username}</strong>,</p>
                            <p style="font-size: 16px; color: #333;">
                                Tài khoản của bạn đã bị <span style="color: #d32f2f; font-weight: bold;">chặn</span> với lý do:
                                <strong>${reason || 'Vi phạm quy định của hệ thống'}</strong>.
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                Nếu bạn có thắc mắc, vui lòng liên hệ với quản trị viên để được hỗ trợ.
                            </p>
                            <p style="font-size: 15px; color: #666; margin-top: 24px;">
                                Trân trọng,<br>
                                <strong>The Key Team</strong>
                            </p>
                        </div>
                    </div>
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
                    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px;">
                            <h2 style="color: #388e3c; margin-bottom: 16px;">Tài khoản đã được mở chặn</h2>
                            <p style="font-size: 16px; color: #333;">Xin chào <strong>${user.username}</strong>,</p>
                            <p style="font-size: 16px; color: #333;">
                                Tài khoản của bạn đã được <span style="color: #388e3c; font-weight: bold;">mở chặn</span>. Bạn có thể đăng nhập lại vào hệ thống ngay bây giờ.
                            </p>
                            <p style="font-size: 15px; color: #666; margin-top: 24px;">
                                Trân trọng,<br>
                                <strong>The Key Team</strong>
                            </p>
                        </div>
                    </div>
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
                    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px;">
                            <h2 style="color: #1a73e8; margin-bottom: 16px;">Chào mừng đến với The Key!</h2>
                            <p style="font-size: 16px; color: #333;">Xin chào <strong>${user.username}</strong>,</p>
                            <p style="font-size: 16px; color: #333;">
                                Chào mừng bạn đến với nền tảng học tập <strong>The Key</strong>!
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                Tài khoản của bạn đã được tạo thành công. Bạn có thể bắt đầu khám phá các khóa học ngay bây giờ.
                            </p>
                            <p style="font-size: 15px; color: #666; margin-top: 24px;">
                                Trân trọng,<br>
                                <strong>The Key Team</strong>
                            </p>
                        </div>
                    </div>
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

    async sendCodeToChangeBank(code) {
        if (!this.emailConfigured) {
            console.warn('Không thể gửi email thông báo mở chặn vì dịch vụ email chưa được cấu hình.');
            return false;
        }

        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: 'quanggiap04@gmail.com',
                subject: 'Xác nhận thay đổi về tài khoản ngân hàng',
                html: `
                    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 24px;">
                        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px;">
                            <h2 style="color: #1a73e8; margin-bottom: 16px;">Xác nhận thay đổi tài khoản ngân hàng</h2>
                            <p style="font-size: 16px; color: #333;">Xin chào bạn,</p>
                            <p style="font-size: 16px; color: #333;">
                                Bạn vừa yêu cầu thay đổi thông tin tài khoản ngân hàng trên hệ thống <strong>The Key</strong>.
                            </p>
                            <p style="font-size: 16px; color: #333;">
                                Mã xác nhận của bạn là:
                            </p>
                            <div style="text-align: center; margin: 24px 0;">
                                <span style="display: inline-block; font-size: 28px; letter-spacing: 2px; background: #f1f5fb; color: #1a73e8; padding: 12px 32px; border-radius: 6px; font-weight: bold;">
                                    ${code}
                                </span>
                            </div>
                            <p style="font-size: 15px; color: #666; margin-top: 24px;">
                                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này hoặc liên hệ với quản trị viên.
                            </p>
                            <p style="font-size: 15px; color: #666; margin-top: 24px;">
                                Trân trọng,<br>
                                <strong>The Key Team</strong>
                            </p>
                        </div>
                    </div>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Đã gửi mã xác nhận thay đổi ngân hàng');
            
            return result;
        } catch (error) {
            console.error('Lỗi khi gửi email mở chặn:', error.message);
            throw error;
        }
    }
}

module.exports = new EmailService();