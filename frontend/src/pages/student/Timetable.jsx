import React, { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { getClasses, getMyAttendance } from '../../services/api';

export default function StudentTimetable() {
  const [classes, setClasses] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, attRes] = await Promise.all([
          getClasses(),
          getMyAttendance()
        ]);
        setClasses(classRes.data);
        setAttendanceData(attRes.data.records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '14:00 - 15:00', '15:00 - 16:00'];

  const getClassForSlot = (day, time) => {
    const start = time.split(' - ')[0];
    return classes.find(c => c.day === day && c.startTime === start);
  };

  const currentWeekDates = React.useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const dates = {};
    const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const offset = d.getTimezoneOffset();
      const adjusted = new Date(d.getTime() - (offset*60*1000));
      dates[daysArr[i + 1]] = adjusted.toISOString().split('T')[0];
    }
    return dates;
  }, []);

  const getAttendanceStatus = (classId, day) => {
    if (!attendanceData) return null;
    const dateStr = currentWeekDates[day];
    const record = attendanceData.find(r => 
      (typeof r.classId === 'object' ? r.classId._id === classId : r.classId === classId) && 
      r.date === dateStr
    );
    return record ? record.status : null;
  };

  return (
    <div className="app-layout">
      <StudentSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>My Timetable</h1>
            <p>Your academic schedule for the week.</p>
          </div>
        </div>

        {loading ? (
          <div className="loader">Loading timetable...</div>
        ) : (
          <div className="table-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
            <div className="timetable-grid">
              <div className="timetable-header" style={{ border: 'none' }}></div>
              {days.map(day => (
                <div key={day} className="timetable-header">{day}</div>
              ))}

              {times.map(time => (
                <React.Fragment key={time}>
                  <div className="timetable-time-col">
                    <div className="timetable-time-slot">{time}</div>
                  </div>
                  {days.map(day => {
                    const classObj = getClassForSlot(day, time);
                    return (
                      <div key={`${day}-${time}`} className="timetable-day-col">
                        {classObj ? (
                          <div className="class-card" style={{ cursor: 'default' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div className="class-subject" style={{ paddingRight: '0.5rem' }}>{classObj.subject}</div>
                                {(() => {
                                  const status = getAttendanceStatus(classObj._id, day);
                                  if (!status) return null;
                                  let badgeClass = 'badge-gray';
                                  let label = status;
                                  if (status === 'present') { badgeClass = 'badge-green'; label = 'Present'; }
                                  if (status === 'absent') { badgeClass = 'badge-red'; label = 'Absent'; }
                                  if (status === 'duty_leave') { badgeClass = 'badge-blue'; label = 'Duty Leave'; }
                                  return <span className={`badge ${badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', whiteSpace: 'nowrap' }}>{label}</span>;
                                })()}
                              </div>
                              <div className="class-code">{classObj.subjectCode}</div>
                            </div>
                            <div className="class-details">
                              <span>{classObj.room}</span>
                              <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                {classObj.teacherId?.name || 'Prof'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ minHeight: '150px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', opacity: 0.5 }}></div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
