const Student = require('../models/Student');
const addStudent = async (req, res) => {
  try {
    const { name, rollNumber, email, course, semester } = req.body;
    const existing = await Student.findOne({ $or: [{ rollNumber }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'Student with this roll number or email already exists' });
    }
    const student = await Student.create({ name, rollNumber, email, course, semester });
    return res.status(201).json({ message: 'Student added successfully', student });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.status(200).json({ count: students.length, students });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json({ student });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    return res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports = { addStudent, getAllStudents, getStudentById, updateStudent, deleteStudent };