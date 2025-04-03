const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const Admin = new Schema({
    admin_name: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    power: { type: Number, default: 10, required: true },
}, {
    timestamps: true
})

// Add plugin
Admin.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('Admin', Admin)