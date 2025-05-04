const BankAccount = require("../models/BankAccount");
const crypto = require('crypto');
const EmailService = require("../../services/EmailService");

class BankAccountController {

    show(req, res) {
        res.render('bank');
    }

    async sendOTP(req, res) {
        try {
            const currentUser = req.session.user;

            if (currentUser.power !== 0) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const otp = crypto.randomBytes(4).toString('hex');
            req.session.user.otp = otp;
            req.session.user.otpExpires = Date.now() + 5 * 60 * 1000;
            req.session.save();

            await EmailService.sendCodeToChangeBank(otp)
            res.status(200).json({ success: true, message: 'OTP sent successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    verifyOTP(req, res) {
        try {
            const { otp } = req.body;
            const currentUser = req.session.user;


            if (currentUser.power !== 0) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            if (!currentUser || !currentUser.otp) {
                return res.status(400).json({ message: 'Không tìm thấy OTP trong session.' });
            }

            // Kiểm tra hết hạn OTP
            if (!currentUser.otpExpires || Date.now() > currentUser.otpExpires) {
                return res.status(400).json({ success: false, message: 'Mã xác nhận đã hết hạn, vui lòng lấy lại mã mới.' });
            }

            if (otp === currentUser.otp) {
                return res.status(200).json({ success: true, message: 'OTP verified successfully' });
            } else {
                return res.status(400).json({ success: false, message: 'Invalid OTP' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async checkBankAccount(req, res) {
        try {
            const countAccount = await BankAccount.countDocuments()
            return res.status(200).json({ success: true, countAccount });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async store(req, res) {
        try {
            await BankAccount.deleteMany();

            const { bankName, accountNumber } = req.body;

            const bankAccount = new BankAccount({
                accountNumber,
                bankName
            });

            await bankAccount.save();

            res.render('bank');
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Số tài khoản đã tồn tại!' });
            }
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getBankAccount(req, res) {
        try {
            const bank = await BankAccount.find().select('accountNumber bankName').lean();
            res.status(200).json({ success: true, bank: bank[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new BankAccountController();