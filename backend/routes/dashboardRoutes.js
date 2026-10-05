const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, requireTeacher } = require('../middleware/authMiddleware');
router.get('/', protect, requireTeacher, getDashboardStats);
module.exports = router;