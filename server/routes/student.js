const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage });

router.post('/records', auth, studentController.addRecord);
router.get('/records', auth, studentController.getRecords);
router.get('/notifications', auth, studentController.getNotifications);
router.post('/upload', auth, upload.single('file'), studentController.uploadDocument);

module.exports = router;
