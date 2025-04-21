const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')

const Course = new Schema({
    title: { type: String, required: true },
    description: { type: String, maxLength: 255 },
    thumbnail: { type: String, default: '' },
    slug: { type: String, slug: 'title', unique: true },
    isPremium: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    salePrice: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
})

// Add plugin
mongoose.plugin(slug)
Course.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

// Thêm index cho tìm kiếm
Course.index({ isPremium: 1 });

module.exports = mongoose.model('Course', Course)