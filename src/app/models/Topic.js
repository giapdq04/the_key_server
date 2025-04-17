const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const Topic = new Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    totalWords: { type: Number, default: 0, required: true },
}, {
    timestamps: true
})

// Add plugin
Topic.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('Topic', Topic)