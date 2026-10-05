import { useEffect, useState } from 'react';
import TeacherSidebar from '../../components/TeacherSidebar';
import { getAllAttendance, getStudents } from '../../services/api';

export default function TeacherReports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ lowAttendance: [] });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [attRes, stdRes] = await Promise.all([
          getAllAttendance(),
          getStudents()
        ]);
        
        const records = attRes.data.records;
        const students = stdRes.data.students || [];
        
        // Calculate student-wise stats
        const studentStats = {};
        students.forEach(s => {
          studentStats[s._id] = { student: s, total: 0, present: 0 };
        });
        
        records.forEach(r => {
          if (studentStats[r.studentId._id]) {
            if (r.status !== 'duty_leave') {
              studentStats[r.studentId._id].total += 1;
              if (r.status === 'present') studentStats[r.studentId._id].present += 1;
            }
          }
        });
        
        const lowAttendance = Object.values(studentStats)
          .map(s => {
            const pct = s.total > 0 ? (s.present / s.total) * 100 : 0;
            return { ...s, percentage: pct };
          })
          .filter(s => s.percentage < 75 && s.total > 0)
          .sort((a,b) => a.percentage - b.percentage);
          
        setStats({ lowAttendance });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Attendance Reports</h1>
            <p>Analytical overview of student attendance.</p>
          </div>
        </div>

        <div className="table-card" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 'calc(100vh - 200px)' }}>
          <div className="table-toolbar">
            <h3 style={{ color: 'var(--danger)' }}>Students Below 75% Attendance</h3>
          </div>
          <div className="table-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div className="loader">Analyzing data...</div>
            ) : stats.lowAttendance.length === 0 ? (
              <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3>Great News!</h3>
                <p>No students have attendance below 75%.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowAttendance.map(stat => (
                    <tr key={stat.student._id}>
                      <td>{stat.student.rollNumber}</td>
                      <td>{stat.student.name}</td>
                      <td>{stat.student.course} - Sem {stat.student.semester}</td>
                      <td>
                        <span className="badge badge-red">{stat.percentage.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
