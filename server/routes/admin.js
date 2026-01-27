const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

router.get('/students', auth, adminController.getAllStudents);
router.get('/students/:id', auth, adminController.getStudentDetails);
router.delete('/students/:id', auth, adminController.deleteStudent);
router.post('/verify-milestone', auth, adminController.verifyMilestone);
router.post('/send-notification', auth, adminController.sendNotification);

module.exports = router;
