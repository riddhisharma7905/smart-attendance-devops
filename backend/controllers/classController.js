const Class = require('../models/Class');
const Student = require('../models/Student');

const getMyClasses = async (req, res) => {
  try {
    if (req.user.role === 'teacher') {
      const classes = await Class.find({ teacherId: req.user._id }).sort({ day: 1, startTime: 1 });
      return res.status(200).json(classes);
    } else {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      const classes = await Class.find({ 
        course: student.course, 
        semester: student.semester, 
        section: student.section 
      }).populate('teacherId', 'name').sort({ day: 1, startTime: 1 });
      return res.status(200).json(classes);
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getClassStudents = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    if (classObj.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this class' });
    }

    const students = await Student.find({
      course: classObj.course,
      semester: classObj.semester,
      section: classObj.section
    }).sort({ rollNumber: 1 });
    
    return res.status(200).json({ class: classObj, students });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyClasses, getClassStudents };
