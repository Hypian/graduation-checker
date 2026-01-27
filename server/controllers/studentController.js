const User = require('../models/User');
const Record = require('../models/Record');
const Course = require('../models/Course');

exports.addRecord = async (req, res) => {
    try {
        const { courseCode, grade } = req.body;
        const studentId = req.user.id;

        // Verify course exists
        const course = await Course.findOne({ code: courseCode });
        if (!course) return res.status(404).json({ message: 'Course not found in curriculum' });

        // Add or update record
        let record = await Record.findOne({ student: studentId, courseId: courseCode });
        
        if (record) {
            record.grade = grade;
            record.dateAdded = Date.now();
        } else {
            record = new Record({
                student: studentId,
                courseId: courseCode,
                courseName: course.name,
                grade
            });
        }

        await record.save();
        res.json(record);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRecords = async (req, res) => {
    try {
        const records = await Record.find({ student: req.user.id });
        res.json(records);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notifications');
        res.json(user.notifications || []);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const { type } = req.body;
        const studentId = req.user.id;

        const user = await User.findById(studentId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure milestones object exists
        if (!user.milestones) {
            user.milestones = {
                'Financial Clearance': { status: 'missing' },
                'Library Clearance': { status: 'missing' },
                'Transcript': { status: 'missing' },
                'Academic Internship': { status: 'missing' },
                'Project Defense': { status: 'missing' }
            };
        }

        // Update the specific milestone
        user.milestones[type] = {
            status: 'pending',
            filename: req.file.filename,
            uploadDate: new Date()
        };
        
        // Critical for persistence with the 'Object' type
        user.markModified('milestones');
        await user.save();

        res.json({ 
            message: 'File uploaded successfully', 
            filename: req.file.filename,
            milestones: user.milestones
        });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Server error: ' + err.message });
    }
};
