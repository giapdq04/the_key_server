const e = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const UserProgress = new Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    completedLessons: [{
        lessonID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        status: {
            type: Number,
            enum: [1, 2, 3],
            default: 3
        }
    }]
}, {
    timestamps: true
});

// Add index for faster lookups
UserProgress.index({ userID: 1, courseID: 1 }, { unique: true });

// Add plugins
UserProgress.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
});

module.exports = mongoose.model('UserProgress', UserProgress);