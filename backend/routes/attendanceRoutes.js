const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAllAttendance,
  getAttendanceByClass,
  getMyAttendance,
} = require('../controllers/attendanceController');
const { protect, requireTeacher } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getMyAttendance); 

router.post('/', requireTeacher, markAttendance);
router.get('/', requireTeacher, getAllAttendance);
router.get('/class/:classId', requireTeacher, getAttendanceByClass);

module.exports = router;