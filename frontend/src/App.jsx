import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleProtectedRoute from './components/RoleProtectedRoute';

import Login from './pages/Login';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherTimetable from './pages/teacher/Timetable';
import TeacherStudents from './pages/teacher/Students';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherClassAttendance from './pages/teacher/ClassAttendance';
import TeacherReports from './pages/teacher/Reports';
import TeacherProfile from './pages/teacher/Profile';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentTimetable from './pages/student/Timetable';
import StudentAttendance from './pages/student/Attendance';
import StudentProfile from './pages/student/Profile';

function DefaultRoute() {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<DefaultRoute />} />
        <Route path="/login" element={<Login />} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/teacher/timetable" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherTimetable />
          </RoleProtectedRoute>
        } />
        <Route path="/teacher/students" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherStudents />
          </RoleProtectedRoute>
        } />
        <Route path="/teacher/attendance" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherAttendance />
          </RoleProtectedRoute>
        } />
        <Route path="/teacher/attendance/:classId" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherClassAttendance />
          </RoleProtectedRoute>
        } />
        <Route path="/teacher/reports" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherReports />
          </RoleProtectedRoute>
        } />
        <Route path="/teacher/profile" element={
          <RoleProtectedRoute allowedRoles={['teacher']}>
            <TeacherProfile />
          </RoleProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={
          <RoleProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/student/timetable" element={
          <RoleProtectedRoute allowedRoles={['student']}>
            <StudentTimetable />
          </RoleProtectedRoute>
        } />
        <Route path="/student/attendance" element={
          <RoleProtectedRoute allowedRoles={['student']}>
            <StudentAttendance />
          </RoleProtectedRoute>
        } />
        <Route path="/student/profile" element={
          <RoleProtectedRoute allowedRoles={['student']}>
            <StudentProfile />
          </RoleProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}