const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const Admin = new Schema({
    admin_name: { type: String, required: true },
    password: { type: String, required: true },
    power: { type: Number, required: true }
}, {
    timestamps: true
})

// Add plugin
Admin.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('Admin', Admin)