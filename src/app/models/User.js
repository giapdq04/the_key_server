const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const User = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
    lastLogin: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, {
    timestamps: true
})

// Add plugin
User.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('User', User)