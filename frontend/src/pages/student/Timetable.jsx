import React, { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { getClasses } from '../../services/api';

export default function StudentTimetable() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await getClasses();
        setClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '12:00 - 13:00', '14:00 - 15:00', '15:00 - 16:00'];

  const getClassForSlot = (day, time) => {
    const start = time.split(' - ')[0];
    return classes.find(c => c.day === day && c.startTime === start);
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
                              <div className="class-subject">{classObj.subject}</div>
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
