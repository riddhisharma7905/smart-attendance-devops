const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');

const markAttendance = async (req, res) => {
  try {
    const { studentId, classId, date, status } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    const classObj = await Class.findById(classId);
    if (!classObj) return res.status(404).json({ message: 'Class not found' });
    
    if (classObj.teacherId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this class' });
    }

    let attendance = await Attendance.findOne({ studentId, classId, date });
    if (attendance) {
      attendance.status = status;
      await attendance.save();
      return res.status(200).json({ message: 'Attendance updated successfully', attendance });
    } else {
      attendance = await Attendance.create({ 
        studentId, 
        classId, 
        teacherId: req.user._id,
        date, 
        status 
      });
      return res.status(201).json({ message: 'Attendance marked successfully', attendance });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAttendanceByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date query parameter is required' });

    const records = await Attendance.find({ classId, date })
      .populate('studentId', 'name rollNumber');
      
    return res.status(200).json({ records });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ teacherId: req.user._id })
      .populate('studentId', 'name rollNumber course semester section')
      .populate('classId', 'subject subjectCode')
      .sort({ date: -1 });
    return res.status(200).json({ count: records.length, records });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    const records = await Attendance.find({ studentId: student._id })
      .populate('classId', 'subject subjectCode teacherId')
      .sort({ date: -1 });
      
    const total = records.length;
    const dutyLeave = records.filter((r) => r.status === 'duty_leave').length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    
    const countableTotal = present + absent;
    const percentage = countableTotal > 0 ? ((present / countableTotal) * 100).toFixed(2) : 0;
    
    return res.status(200).json({
      student: { name: student.name, rollNumber: student.rollNumber, course: student.course, semester: student.semester, section: student.section },
      summary: { total, present, absent, dutyLeave, attendancePercentage: `${percentage}%` },
      records,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { markAttendance, getAttendanceByClass, getAllAttendance, getMyAttendance };