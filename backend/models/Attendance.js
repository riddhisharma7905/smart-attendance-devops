const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: String, 
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'duty_leave'],
      required: [true, 'Status is required'],
    },
  },
  { timestamps: true }
);
attendanceSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', attendanceSchema);