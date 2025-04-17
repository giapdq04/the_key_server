const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const Words = new Schema({
    topicID: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    word: { type: String, required: true },
    meaning: { type: String, required: true },
    example: { type: String, required: true },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, {
    timestamps: true
})

// Add index for query performance
Words.index({ userID: 1 });

// Add plugin
Words.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('Words', Words)