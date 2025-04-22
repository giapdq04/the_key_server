const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const Bank = new Schema({
    bankName: { type: String, required: true, trim: true },
}, {
    timestamps: true
})

// Add plugin
Bank.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('Bank', Bank)