const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Course = new Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    status: { type: Number, default: 3 },
    duration: { type: Number, default: 0 },
    ytbVideoId: { type: String, default: '' }
})

module.exports = mongoose.model('Course', Course)