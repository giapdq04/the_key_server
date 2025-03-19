const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const Lesson = new Schema({
    title: { type: String, required: true },
    ytbVideoID: { type: String },
    docID: { type: String },
    questions: { type: String },
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    sectionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    duration: { type: String },
}, {
    timestamps: true
});

// Add plugins
Lesson.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
});

module.exports = mongoose.model('Lesson', Lesson);