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
        completedAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastAccessedLesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    progress: {
        type: Number,
        default: 0 // Phần trăm hoàn thành (0-100)
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
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