const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    subjectCode: { type: String, required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: String, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);
