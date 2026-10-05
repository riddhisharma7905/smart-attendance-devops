import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { getClassStudents, getAttendanceByClass, markAttendance } from '../../services/api';

export default function TeacherClassAttendance() {
  const { classId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [classObj, setClassObj] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const initialDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await getClassStudents(classId);
        setClassObj(data.class);
        setStudents(data.students);
        
        const attRes = await getAttendanceByClass(classId, date);
        const currentAtt = {};
        attRes.data.records.forEach(rec => {
          const sId = typeof rec.studentId === 'object' ? rec.studentId._id : rec.studentId;
          currentAtt[sId] = rec.status;
        });
        setAttendanceState(currentAtt);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 403 || err.response?.status === 404) {
          alert('Not authorized or class not found');
          navigate('/teacher/timetable');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classId, date, navigate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const newState = {};
    students.forEach(s => { newState[s._id] = status; });
    setAttendanceState(newState);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(attendanceState).map(([studentId, status]) => 
        markAttendance({ studentId, classId, date, status })
      );
      await Promise.all(promises);
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const isAttendanceAllowed = () => {
    if (!classObj || !date) return false;
    const now = new Date();
    const [hours, minutes] = classObj.startTime.split(':').map(Number);
    const classStartDateTime = new Date(date);
    classStartDateTime.setHours(hours, minutes, 0, 0);
    
    const oneWeekLater = new Date(classStartDateTime);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    return now >= classStartDateTime && now <= oneWeekLater;
  };

  const allowed = isAttendanceAllowed();

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header" style={{ marginBottom: '1rem' }}>
          <div>
            <button className="btn btn-sm btn-secondary" style={{ marginBottom: '1rem' }} onClick={() => navigate('/teacher/timetable')}>
              ← Back to Timetable
            </button>
            <h1>Mark Attendance</h1>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {loading ? (
          <div className="loader">Loading class details...</div>
        ) : (
          <>
            {classObj && (
              <div className="stat-card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)', background: 'linear-gradient(to right, var(--surface), var(--bg))' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{classObj.subject} ({classObj.subjectCode})</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {classObj.course} • Sem {classObj.semester} • Section {classObj.section} • {classObj.room}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 600, color: 'var(--primary)' }}>{classObj.startTime} - {classObj.endTime}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{students.length} Enrolled</p>
                </div>
              </div>
            )}

            <div className="table-card">
              <div className="table-toolbar">
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', width: '250px' }}
                />
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {!allowed && <span style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 500 }}>Time locked</span>}
                  <button className="btn btn-secondary btn-sm" onClick={() => markAll('present')} disabled={!allowed}>Mark All Present</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => markAll('absent')} disabled={!allowed}>Mark All Absent</button>
                  <button className="btn btn-primary btn-sm" onClick={saveAttendance} disabled={saving || Object.keys(attendanceState).length === 0 || !allowed}>
                    {saving ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </div>
              
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '150px' }}>Roll No</th>
                      <th>Student Name</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const status = attendanceState[student._id];
                      return (
                        <tr key={student._id}>
                          <td style={{ fontWeight: 500 }}>{student.rollNumber}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              {student.name}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button 
                                className={`btn btn-sm ${status === 'present' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleStatusChange(student._id, 'present')}
                                disabled={!allowed}
                                style={status === 'present' ? { background: 'var(--success)', borderColor: 'var(--success)' } : {}}
                              >
                                Present
                              </button>
                              <button 
                                className={`btn btn-sm ${status === 'absent' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleStatusChange(student._id, 'absent')}
                                disabled={!allowed}
                                style={status === 'absent' ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                              >
                                Absent
                              </button>
                              <button 
                                className={`btn btn-sm ${status === 'duty_leave' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleStatusChange(student._id, 'duty_leave')}
                                disabled={!allowed}
                                style={status === 'duty_leave' ? { background: 'var(--warning)', borderColor: 'var(--warning)', color: '#fff' } : {}}
                              >
                                Duty Leave
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <tr>
                        <td colSpan="3" className="empty-state">No students found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
