const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const totalClasses = await Class.countDocuments({ teacherId: req.user._id });
    
    const teacherClasses = await Class.find({ teacherId: req.user._id });
    
    let totalStudents = 0;
    const queryConds = teacherClasses.map(c => ({ course: c.course, semester: c.semester, section: c.section }));
    if (queryConds.length > 0) {
      const students = await Student.find({ $or: queryConds });
      totalStudents = students.length;
    }

    const presentToday = await Attendance.countDocuments({
      date: today,
      status: 'present',
      teacherId: req.user._id
    });
    
    const absentToday = await Attendance.countDocuments({
      date: today,
      status: 'absent',
      teacherId: req.user._id
    });
    
    const totalRecords = await Attendance.countDocuments({ teacherId: req.user._id, status: { $ne: 'duty_leave' } });
    const totalPresent = await Attendance.countDocuments({ status: 'present', teacherId: req.user._id });
    const averageAttendance = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(2) : 0;
    
    return res.status(200).json({
      date: today,
      totalClasses,
      totalStudents,
      presentToday,
      absentToday,
      averageAttendance: `${averageAttendance}%`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats };