const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Order = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    payment_status: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Canceled'],
        default: 'Unpaid'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', Order)