const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const Slide = new Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    link: { type: String },
    order: { type: Number, default: 1 },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Add plugins
Slide.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
});

module.exports = mongoose.model('Slide', Slide);