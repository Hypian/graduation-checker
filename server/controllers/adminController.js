const User = require('../models/User');
const Record = require('../models/Record');

exports.getAllStudents = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
        
        const students = await User.find({ role: 'student' }).select('-password');
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getStudentDetails = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const student = await User.findById(req.params.id).select('-password');
        const records = await Record.find({ student: req.params.id });

        const studentObj = student.toObject();
        
        // Ensure all 5 mandatory milestones exist
        const mandatoryKeys = [
            'Financial Clearance',
            'Library Clearance',
            'Transcript',
            'Academic Internship',
            'Project Defense'
        ];

        const milestonesObj = student.milestones || {};
        const fullMilestones = {};
        
        mandatoryKeys.forEach(key => {
            fullMilestones[key] = milestonesObj[key] || { status: 'missing', filename: null, uploadDate: null };
        });

        studentObj.milestones = fullMilestones;

        res.json({ student: studentObj, records });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        await User.findByIdAndDelete(req.params.id);
        await Record.deleteMany({ student: req.params.id });

        res.json({ message: 'Student and related records deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyMilestone = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { studentId, milestoneKey, status } = req.body;
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (!student.milestones) student.milestones = {};
        
        const currentData = student.milestones[milestoneKey] || { status: 'missing' };
        
        student.milestones[milestoneKey] = {
            ...currentData,
            status: status
        };

        student.markModified('milestones');
        await student.save();

        res.json({ 
            message: `Milestone ${milestoneKey} updated to ${status}`,
            milestones: student.milestones
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendNotification = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

        const { studentId, title, message } = req.body;
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        if (!student.notifications) student.notifications = [];
        
        student.notifications.unshift({
            title,
            message,
            date: new Date(),
            read: false
        });

        await student.save();
        res.json({ message: 'Message dispatched successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
