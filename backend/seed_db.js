require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Student = require('./models/Student');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    await User.deleteMany({});
    await Student.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});

    const teacherPwd = 'teacher123';
    const studentPwd = 'student123';

    const teacherNames = [
      'Arvind Kumar', 'Dr. Ramesh Kumar', 'Dr. Sunita Sharma', 'Prof. Anil Gupta', 
      'Dr. Priya Desai', 'Prof. Rajesh Singh', 'Dr. Meera Patel', 'Prof. Sanjay Verma', 
      'Dr. Kavita Joshi', 'Prof. Amit Chauhan'
    ];

    const teachers = [];
    for (let i = 0; i < 10; i++) {
      const t = await User.create({
        name: teacherNames[i],
        email: `teacher${i+1}@college.com`,
        password: teacherPwd,
        role: 'teacher'
      });
      teachers.push(t);
    }

    // Dynamic Schedule Generator
    const classesData = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '12:00', end: '13:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' }
    ];

    const sems = [
      {
        sem: 1, // 20 Credits (4*4 + 3*1 + 1*1)
        subjects: [
          { name: 'Introduction to Programming', code: 'CSE1101', t: 0, cr: 4 },
          { name: 'Mathematics I', code: 'MAT1101', t: 1, cr: 4 },
          { name: 'Physics', code: 'PHY1101', t: 2, cr: 4 },
          { name: 'Communication Skills', code: 'ENG1101', t: 3, cr: 4 },
          { name: 'Engineering Graphics', code: 'MEC1101', t: 4, cr: 3 },
          { name: 'Physics Lab', code: 'PHY1101L', t: 2, cr: 1 }
        ]
      },
      {
        sem: 3, // 20 Credits
        subjects: [
          { name: 'Data Structures', code: 'CSE2101', t: 5, cr: 4 },
          { name: 'DBMS', code: 'CSE2102', t: 6, cr: 4 },
          { name: 'Digital Logic Design', code: 'ECE2101', t: 7, cr: 4 },
          { name: 'OOP in Java', code: 'CSE2103', t: 8, cr: 4 },
          { name: 'Discrete Mathematics', code: 'MAT2101', t: 9, cr: 3 },
          { name: 'Data Structures Lab', code: 'CSE2101L', t: 5, cr: 1 }
        ]
      },
      {
        sem: 5, // 20 Credits
        subjects: [
          { name: 'Operating Systems', code: 'CSE3101', t: 0, cr: 4 },
          { name: 'Computer Networks', code: 'CSE3102', t: 1, cr: 4 },
          { name: 'Software Engineering', code: 'CSE3103', t: 2, cr: 4 },
          { name: 'Artificial Intelligence', code: 'CSE3105', t: 3, cr: 4 },
          { name: 'Theory of Computation', code: 'CSE3104', t: 4, cr: 3 },
          { name: 'Operating Systems Lab', code: 'CSE3101L', t: 0, cr: 1 }
        ]
      },
      {
        sem: 7, // 6 Credits
        subjects: [
          { name: 'Machine Learning', code: 'CSE4101', t: 5, cr: 3 },
          { name: 'Cloud Computing', code: 'CSE4102', t: 6, cr: 3 }
        ]
      }
    ];

    const teacherSchedule = {};
    const semSchedule = {};

    sems.forEach(semData => {
      semSchedule[semData.sem] = {};
      semData.subjects.forEach(sub => {
        if (!teacherSchedule[sub.t]) teacherSchedule[sub.t] = {};
        
        let scheduledCount = 0;
        
        for (let day of days) {
          if (scheduledCount >= sub.cr) break;
          
          for (let slot of timeSlots) {
            const slotKey = `${day}-${slot.start}`;
            if (!teacherSchedule[sub.t][slotKey] && !semSchedule[semData.sem][slotKey]) {
              teacherSchedule[sub.t][slotKey] = true;
              semSchedule[semData.sem][slotKey] = true;
              
              classesData.push({
                subject: sub.name,
                subjectCode: sub.code,
                teacherId: teachers[sub.t]._id,
                course: 'B.Tech CSE',
                semester: semData.sem,
                section: 'A',
                day: day,
                startTime: slot.start,
                endTime: slot.end,
                room: `Room ${semData.sem}0${sub.t}`
              });
              
              scheduledCount++;
              break; 
            }
          }
        }
      });
    });

    await Class.insertMany(classesData);

    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Rishi', 'Karan', 'Rohit', 'Siddharth', 'Amit', 'Vikram', 'Rohan', 'Raj', 'Rahul', 'Dev', 'Neel', 'Jay', 'Aryan', 'Kiran', 'Prem', 'Ananya', 'Diya', 'Suhani', 'Riya', 'Aanya', 'Pari', 'Sanya', 'Khushi', 'Shruti', 'Neha', 'Pooja', 'Sneha', 'Nisha', 'Tanvi', 'Anjali', 'Maya', 'Meera', 'Roshni', 'Kritika', 'Nandini', 'Priya', 'Sonal', 'Kavya'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Das', 'Reddy', 'Joshi', 'Chauhan', 'Rajput', 'Bose', 'Yadav', 'Malhotra', 'Kapoor', 'Mehta', 'Nair', 'Pillai', 'Iyer', 'Menon'];

    // Generate Students
    const generateStudents = async (sem, prefix) => {
      for (let i = 1; i <= 30; i++) {
        const rollNum = `${prefix}CSE${i.toString().padStart(3, '0')}`;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const fullName = `${firstName} ${lastName}`;

        const u = await User.create({
          name: fullName,
          email: `${rollNum.toLowerCase()}@college.edu`,
          password: studentPwd,
          role: 'student'
        });
        await Student.create({
          userId: u._id,
          name: fullName,
          rollNumber: rollNum,
          email: `${rollNum.toLowerCase()}@college.edu`,
          course: 'B.Tech CSE',
          semester: sem,
          section: 'A'
        });
      }
    };

    console.log('Generating students for Sem 1...');
    await generateStudents(1, '26');
    console.log('Generating students for Sem 3...');
    await generateStudents(3, '25');
    console.log('Generating students for Sem 5...');
    await generateStudents(5, '24');
    console.log('Generating students for Sem 7...');
    await generateStudents(7, '23');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
