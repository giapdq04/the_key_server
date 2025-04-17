const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete')

const ExerciseStats = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    streakDays: { type: Number, default: 0, required: true },
    maxStreakDays: { type: Number, default: 0, required: true },
    totalPoints: { type: Number, default: 0, required: true },
    vocabLearned: { type: Number, default: 0, required: true },
    dailyGoalPoint: { type: Number, enum: [30, 60, 90], default: 30, required: true },
    todayScore: { type: Number, default: 0, required: true },
    lastCompletedDate: { type: Date, default: null },
}, {
    timestamps: true
})

// Add index for query performance
ExerciseStats.index({ userID: 1 });

// Add plugin
ExerciseStats.plugin(mongooseDelete, {
    overrideMethods: 'all',
    deletedAt: true,
})

module.exports = mongoose.model('ExerciseStats', ExerciseStats)