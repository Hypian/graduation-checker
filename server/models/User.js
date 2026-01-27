const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    regNumber: String,
    phone: String,
    dateJoined: {
        type: Date,
        default: Date.now
    },
    milestones: {
        type: Object,
        default: {
            'Financial Clearance': { status: 'missing', filename: null, uploadDate: null },
            'Library Clearance': { status: 'missing', filename: null, uploadDate: null },
            'Transcript': { status: 'missing', filename: null, uploadDate: null },
            'Academic Internship': { status: 'missing', filename: null, uploadDate: null },
            'Project Defense': { status: 'missing', filename: null, uploadDate: null }
        }
    },
    notifications: [{
        title: String,
        message: String,
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false }
    }]
});

module.exports = mongoose.model('User', UserSchema);
