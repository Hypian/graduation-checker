const express = require('express');
const router = express.Router();
const curriculumController = require('../controllers/curriculumController');
const auth = require('../middleware/auth');

router.get('/', curriculumController.getCourses);
router.post('/', auth, curriculumController.addCourse);
router.delete('/:id', auth, curriculumController.deleteCourse);

module.exports = router;
