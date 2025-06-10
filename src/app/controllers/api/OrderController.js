const { default: mongoose } = require("mongoose");
const Course = require("../../models/Course");
const Order = require("../../models/Order");
const BankAccount = require("../../models/BankAccount");
const OrderStatus = require("../../../constants/OrderStatus");

class OrderController {

    async createOrder(req, res) {
        try {
            const { userId, courseId } = req.body;

            if (!userId || !courseId) {
                return res.status(400).json({ message: 'Chưa nhập id' });
            }

            if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
                return res.status(400).json({ message: 'userId hoặc courseId không hợp lệ' });
            }

            const course = await Course.findById(courseId).select('price');

            const newOrder = new Order({
                userId,
                courseId,
                payment_status: OrderStatus.UNPAID
            })

            await newOrder.save();

            const bankAccount = await BankAccount.findOne().select('accountNumber bankName');

            res.status(200).json({
                message: 'Order created successfully',
                qrCodeUrl: `https://qr.sepay.vn/img?acc=${bankAccount.accountNumber}&bank=${bankAccount.bankName}&amount=${course.price}&des=${newOrder._id}`,
            });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async sepayCallWebhook(req, res) {
        try {
            const apiKey = req.headers.authorization.replace('Apikey ', '');
            const secretKey = process.env.SEPAY_SECRET_KEY;

            if (!apiKey || apiKey !== secretKey) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const transaction = req.body;
            console.log('Webhook received:', transaction);

            const orderId = transaction.content.match(/\b[a-f0-9]{24}\b/gi)[0];

            const order = await Order.findById(orderId);
            if (!order) {
                console.log("Không tìm thấy đơn hàng:", orderId);
                return res.status(404).json({ message: 'Order not found' });
            }

            const course = await Course.findById(order.courseId).select('price');

            if (course.price !== transaction.transferAmount) {
                console.log("Số tiền không hợp lệ:", course.price, transaction.transferAmount);
                return res.status(400).json({ message: 'Số tiền không hợp lệ' });
            }

            await Order.updateOne(
                { _id: orderId },
                {
                    payment_status: OrderStatus.PAID,
                }
            )

            // Gửi thông báo realtime đến client
            if (global.socketUtils) {
                global.socketUtils.notifyPaymentSuccess(order.userId, order.courseId);
            }

            res.status(200).json({
                success: true,
                message: 'Webhook received successfully',
            });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    // async cancelOrder(req, res) {
    //     try {
    //         const { userId, courseId } = req.body;
    //         console.log(userId, courseId);


    //         if (!userId || !courseId) {
    //             return res.status(400).json({ message: 'Chưa nhập id' });
    //         }

    //         if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(courseId)) {
    //             return res.status(400).json({ message: 'userId hoặc courseId không hợp lệ' });
    //         }

    //         const order = await Order.findOne({ userId, courseId });
    //         if (!order) {
    //             return res.status(404).json({ message: 'Order not found' });
    //         }

    //         if (order.payment_status === 'Paid') {
    //             return res.status(400).json({ message: 'Cannot cancel a paid order' });
    //         }

    //         await Order.updateOne(
    //             { userId, courseId },
    //             {
    //                 payment_status: 'Canceled',
    //             }
    //         )

    //         res.status(200).json({
    //             message: 'Order canceled successfully',
    //         });
    //     } catch (error) {
    //         console.error('Error canceling order:', error);
    //         res.status(500).json({ message: 'Internal server error' });
    //     }
    // }
}

module.exports = new OrderController();
