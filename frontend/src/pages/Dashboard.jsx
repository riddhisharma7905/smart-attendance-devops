import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../services/api';
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back! Here's today's attendance overview.</p>
        </div>
        {loading && <div className="loader">Loading stats...</div>}
        {error && <div className="alert alert-error">{error}</div>}
        {stats && (
          <>
            <div className="stats-grid">
              <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="#6366f1" />
              <StatCard title="Present Today" value={stats.presentToday} icon="✅" color="#10b981" />
              <StatCard title="Absent Today" value={stats.absentToday} icon="❌" color="#ef4444" />
              <StatCard title="Avg Attendance" value={stats.averageAttendance} icon="📈" color="#f59e0b" />
            </div>
            <div className="info-card">
              <h3>📅 Today's Date</h3>
              <p>{new Date(stats.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}