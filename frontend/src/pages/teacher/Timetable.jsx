import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { getClasses, getAllAttendance } from '../../services/api';

export default function TeacherTimetable() {
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, attRes] = await Promise.all([
          getClasses(),
          getAllAttendance()
        ]);
        setClasses(classesRes.data);
        setAttendanceRecords(attRes.data.records || []);
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

  const getTargetDateForDay = (dayName) => {
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = dayMap[dayName];
    const now = new Date();
    const currentDay = now.getDay();
    const diff = targetDay - currentDay;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    
    const offset = targetDate.getTimezoneOffset();
    const adjustedDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
    return adjustedDate;
  };

  const isAttendanceAllowed = (targetDate, startTime) => {
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const classStartDateTime = new Date(targetDate);
    classStartDateTime.setHours(hours, minutes, 0, 0);
    
    const oneWeekLater = new Date(classStartDateTime);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    return now >= classStartDateTime && now <= oneWeekLater;
  };

  const isClassMarked = (classId, dateString) => {
    return attendanceRecords.some(r => 
      (typeof r.classId === 'object' ? r.classId._id : r.classId) === classId && 
      r.date.startsWith(dateString)
    );
  };

  const handleClassClick = (classId, dayName) => {
    const targetDate = getTargetDateForDay(dayName);
    const formattedDate = targetDate.toISOString().split('T')[0];
    navigate(`/teacher/attendance/${classId}?date=${formattedDate}`);
  };

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Weekly Timetable</h1>
            <p>Your scheduled classes for the week. Click any class to mark attendance.</p>
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
                    let allowed = false;
                    let targetDate = null;
                    let marked = false;
                    let dateString = '';
                    if (classObj) {
                      targetDate = getTargetDateForDay(day);
                      dateString = targetDate.toISOString().split('T')[0];
                      allowed = isAttendanceAllowed(targetDate, classObj.startTime);
                      marked = isClassMarked(classObj._id, dateString);
                    }

                    return (
                      <div key={`${day}-${time}`} className="timetable-day-col">
                        {classObj ? (
                            <div 
                              className="class-card" 
                              onClick={() => allowed ? handleClassClick(classObj._id, day) : alert('Attendance can only be marked/edited after class start time and up to 1 week later.')}
                              style={{ 
                                opacity: allowed ? 1 : 0.5, 
                                cursor: allowed ? 'pointer' : 'not-allowed'
                              }}
                            >
                              <div>
                                <div className="class-subject">{classObj.subject}</div>
                                <div className="class-code">{classObj.subjectCode}</div>
                            </div>
                            <div className="class-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>{classObj.room}</span>
                                <span>{classObj.course} • Sem {classObj.semester} • Sec {classObj.section}</span>
                              </div>
                              {marked && (
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  Marked (Click to Edit)
                                </div>
                              )}
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
