const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
app.use(cors());                        
app.use(express.json());                
app.use(express.urlencoded({ extended: true })); 
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Attendance Management System backend is running',
    timestamp: new Date().toISOString(),
  });
});
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/students',   require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/classes',    require('./routes/classRoutes'));
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });