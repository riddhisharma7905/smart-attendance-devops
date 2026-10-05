import { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { getMyAttendance } from '../../services/api';

export default function StudentAttendance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await getMyAttendance();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const getSubjectWiseStats = () => {
    if (!data?.records) return [];
    const stats = {};
    data.records.forEach(r => {
      const subj = r.classId?.subject || 'Unknown Subject';
      if (!stats[subj]) stats[subj] = { total: 0, present: 0, absent: 0, dutyLeave: 0 };
      if (r.status !== 'duty_leave') {
        stats[subj].total++;
        if (r.status === 'present') stats[subj].present++;
        if (r.status === 'absent') stats[subj].absent++;
      } else {
        stats[subj].dutyLeave++;
      }
    });
    
    return Object.entries(stats).map(([subject, counts]) => ({
      subject,
      total: counts.total,
      present: counts.present,
      absent: counts.absent,
      dutyLeave: counts.dutyLeave,
      percentage: counts.total > 0 ? ((counts.present / counts.total) * 100).toFixed(0) : 0
    }));
  };

  const subjectStats = getSubjectWiseStats();
  const overallPct = data?.summary?.attendancePercentage ? parseFloat(data.summary.attendancePercentage) : 0;

  return (
    <div className="app-layout">
      <StudentSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>My Attendance</h1>
            <p>Detailed view of your attendance records.</p>
          </div>
        </div>

        {loading ? (
          <div className="loader">Loading attendance...</div>
        ) : (
          <>
            {overallPct < 75 && overallPct > 0 && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <strong>Attendance Warning:</strong> Your overall attendance is {overallPct}%. Please maintain above 75%.
              </div>
            )}



            {subjectStats.length > 0 && (
              <div className="table-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Subject-wise Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {subjectStats.map(stat => (
                    <div 
                      key={stat.subject} 
                      onClick={() => setSelectedSubject(stat)}
                      style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stat.subject}
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>
                        {stat.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="table-card">
              <div className="table-toolbar">
                <h3>Recent Records</h3>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.records?.map(record => (
                      <tr key={record._id}>
                        <td style={{ fontWeight: 500 }}>{record.classId?.subject || 'Unknown Class'}</td>
                        <td>{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>
                          {record.status === 'present' && <span className="badge badge-green">Present</span>}
                          {record.status === 'absent' && <span className="badge badge-red">Absent</span>}
                          {record.status === 'duty_leave' && <span className="badge badge-yellow">Duty Leave</span>}
                        </td>
                      </tr>
                    ))}
                    {(!data?.records || data.records.length === 0) && (
                      <tr>
                        <td colSpan="3">
                          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5, display: 'block' }}>
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 600 }}>No Records Yet</h3>
                            <p style={{ fontSize: '0.95rem' }}>Your attendance data will appear here once classes begin.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {selectedSubject && (
        <div className="modal-overlay" onClick={() => setSelectedSubject(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.2rem' }}>{selectedSubject.subject}</h2>
              <button className="modal-close" onClick={() => setSelectedSubject(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="stat-card" style={{ padding: '1rem', border: '1px solid var(--border)', boxShadow: 'none' }}>
                  <p className="stat-title">Total Classes</p>
                  <p className="stat-value">{selectedSubject.total}</p>
                </div>
                <div className="stat-card" style={{ padding: '1rem', border: '1px solid var(--border)', boxShadow: 'none' }}>
                  <p className="stat-title">Attendance</p>
                  <p className="stat-value" style={{ color: selectedSubject.percentage >= 75 ? 'var(--success)' : 'var(--danger)' }}>{selectedSubject.percentage}%</p>
                </div>
                <div className="stat-card" style={{ padding: '1rem', border: '1px solid var(--border)', boxShadow: 'none' }}>
                  <p className="stat-title">Present</p>
                  <p className="stat-value">{selectedSubject.present}</p>
                </div>
                <div className="stat-card" style={{ padding: '1rem', border: '1px solid var(--border)', boxShadow: 'none' }}>
                  <p className="stat-title">Absent</p>
                  <p className="stat-value">{selectedSubject.absent}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedSubject(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
