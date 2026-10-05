const express = require('express');
const router = express.Router();
const {
  addStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, requireTeacher } = require('../middleware/authMiddleware');
router.use(protect);
router.use(requireTeacher);
router.route('/').post(addStudent).get(getAllStudents);
router.route('/:id').get(getStudentById).put(updateStudent).delete(deleteStudent);
module.exports = router;