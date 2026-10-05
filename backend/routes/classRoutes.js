const express = require('express');
const router = express.Router();
const { getMyClasses, getClassStudents } = require('../controllers/classController');
const { protect, requireTeacher } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getMyClasses);
router.get('/:classId/students', requireTeacher, getClassStudents);

module.exports = router;
