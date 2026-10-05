import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { getAllAttendance } from '../../services/api';

export default function TeacherAttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getAllAttendance();
        setRecords(data.records || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecords = records.filter(r => {
    const matchesDate = !dateFilter || r.date.startsWith(dateFilter);
    const matchesSearch = r.studentId?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          r.studentId?.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
                          r.classId?.subject?.toLowerCase().includes(search.toLowerCase());
    return matchesDate && matchesSearch;
  });

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Attendance History</h1>
            <p>Review all previously marked attendance records.</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/teacher/timetable')}>
            Mark New Attendance
          </button>
        </div>

        <div className="table-card">
          <div className="table-toolbar" style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            />
            <input 
              type="text" 
              placeholder="Search student, roll no, or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '350px', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            />
          </div>
          
          <div className="table-wrapper">
            {loading ? (
              <div className="loader">Loading history...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Class</th>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record._id}>
                      <td>{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{record.classId?.subject}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.classId?.subjectCode}</div>
                      </td>
                      <td>{record.studentId?.rollNumber}</td>
                      <td>{record.studentId?.name}</td>
                      <td>
                        <span className={`badge ${record.status === 'present' ? 'badge-green' : 'badge-red'}`}>
                          {record.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-state">No attendance records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
