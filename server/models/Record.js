const mongoose = require('mongoose');

const CourseRecordSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: String, // Storing code or object reference
        required: true
    },
    courseName: String,
    grade: {
        type: Number,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CourseRecord', CourseRecordSchema);
