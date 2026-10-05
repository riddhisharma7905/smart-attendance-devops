import axios from 'axios';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const login = (data) => API.post('/auth/login', data);

export const getDashboardStats = () => API.get('/dashboard');
export const getStudents = () => API.get('/students');
export const deleteStudent = (id) => API.delete(`/students/${id}`);

export const getClasses = () => API.get('/classes');
export const getClassStudents = (classId) => API.get(`/classes/${classId}/students`);

export const getMyAttendance = () => API.get('/attendance/me');
export const getAllAttendance = () => API.get('/attendance');
export const getAttendanceByClass = (classId, date) => API.get(`/attendance/class/${classId}?date=${date}`);
export const markAttendance = (data) => API.post('/attendance', data);