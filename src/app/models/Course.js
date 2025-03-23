const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-updater')
const mongooseDelete = require('mongoose-delete')

const Course = new Schema({
    title: { type: String, required: true },
    description: { type: String, maxLength: 255 },
    thumbnail: { type: String, default: '' },
    slug: { type: String, slug: 'title', unique: true },
}, {
    timestamps: true
})

// Add plugin
mongoose.plugin(slug)
Course.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('Course', Course)