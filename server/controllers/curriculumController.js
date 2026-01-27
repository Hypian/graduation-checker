const Course = require('../models/Course');
const User = require('../models/User');

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addCourse = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });

        const { code, name } = req.body;
        const newCourse = new Course({ code, name });
        await newCourse.save();

        res.json(newCourse);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Permission denied' });

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
