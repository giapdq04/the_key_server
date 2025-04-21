const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const BankAccount = new Schema({
    accountNumber: { type: String, required: true, unique: true },
    bankName: { type: String, required: true, trim: true },
}, {
    timestamps: true
})

// Add plugin
BankAccount.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('BankAccount', BankAccount)