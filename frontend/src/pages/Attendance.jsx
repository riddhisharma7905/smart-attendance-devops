import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getStudents, getAllAttendance, markAttendance } from '../services/api';
export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [markedMap, setMarkedMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [submitting, setSubmitting] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await getStudents();
        setStudents(data.students);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load students.');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);
  useEffect(() => {
    const fetchRecords = async () => {
      setLoadingRecords(true);
      try {
        const { data } = await getAllAttendance(date);
        setRecords(data.records);
        const map = {};
        data.records.forEach((r) => {
          if (r.studentId?._id) map[r.studentId._id] = r.status;
        });
        setMarkedMap(map);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance.');
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, [date]);
  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };
  const handleMark = async (studentId, status) => {
    if (markedMap[studentId]) {
      setError(`Attendance already marked for this student on ${date}.`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSubmitting((prev) => ({ ...prev, [studentId]: true }));
    try {
      await markAttendance({ studentId, date, status });
      setMarkedMap((prev) => ({ ...prev, [studentId]: status }));
      flashSuccess(`Attendance marked as ${status}.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting((prev) => ({ ...prev, [studentId]: false }));
    }
  };
  const presentCount = Object.values(markedMap).filter(s => s === 'present').length;
  const absentCount = Object.values(markedMap).filter(s => s === 'absent').length;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Attendance</h1>
            <p>Mark and view daily attendance records.</p>
          </div>
          <div className="date-picker-wrap">
            <label>Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="attendance-summary">
          <div className="summary-pill present">✅ Present: {presentCount}</div>
          <div className="summary-pill absent">❌ Absent: {absentCount}</div>
          <div className="summary-pill unmarked">⏳ Unmarked: {students.length - presentCount - absentCount}</div>
        </div>
        <div className="table-card">
          {loadingStudents || loadingRecords ? (
            <div className="loader">Loading...</div>
          ) : students.length === 0 ? (
            <div className="empty-state">No students found. Add students first.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const status = markedMap[s._id];
                    const isSubmitting = submitting[s._id];
                    return (
                      <tr key={s._id} className={status ? `row-${status}` : ''}>
                        <td><span className="badge">{s.rollNumber}</span></td>
                        <td>{s.name}</td>
                        <td>{s.course}</td>
                        <td>Sem {s.semester}</td>
                        <td>
                          {status ? (
                            <span className={`status-badge ${status}`}>
                              {status === 'present' ? '✅ Present' : '❌ Absent'}
                            </span>
                          ) : (
                            <span className="status-badge unmarked">⏳ Unmarked</span>
                          )}
                        </td>
                        <td>
                          {status ? (
                            <span className="marked-label">Marked</span>
                          ) : (
                            <div className="action-btns">
                              <button
                                className="btn btn-sm btn-present"
                                onClick={() => handleMark(s._id, 'present')}
                                disabled={isSubmitting}
                              >
                                Present
                              </button>
                              <button
                                className="btn btn-sm btn-absent"
                                onClick={() => handleMark(s._id, 'absent')}
                                disabled={isSubmitting}
                              >
                                Absent
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {records.length > 0 && (
          <div className="table-card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', margin: 0 }}>
              📋 Attendance Records for {date}
            </h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td><span className="badge">{r.studentId?.rollNumber}</span></td>
                      <td>{r.studentId?.name}</td>
                      <td>{r.studentId?.course}</td>
                      <td>
                        <span className={`status-badge ${r.status}`}>
                          {r.status === 'present' ? '✅ Present' : '❌ Absent'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}