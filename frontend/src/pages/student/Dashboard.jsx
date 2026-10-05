import { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { getMyAttendance, getClasses } from '../../services/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState(localStorage.getItem('studentNotes') || '');

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem('studentNotes', e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, classRes] = await Promise.all([
          getMyAttendance(),
          getClasses()
        ]);
        setData(attRes.data);
        
        setAllClasses(classRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const numDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= numDays; i++) days.push(new Date(year, month, i));
    return days;
  };

  const calendarDays = generateCalendarDays();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDayName = dayNames[selectedDate.getDay()];
  
  const isPastSemester = selectedDate.getFullYear() > 2026 || (selectedDate.getFullYear() === 2026 && selectedDate.getMonth() >= 11);
  const displayClasses = isPastSemester ? [] : allClasses.filter(c => c.day === selectedDayName);

  const isToday = selectedDate.getDate() === new Date().getDate() && 
                  selectedDate.getMonth() === new Date().getMonth() && 
                  selectedDate.getFullYear() === new Date().getFullYear();

  const getAttendanceForClass = (classId) => {
    if (!data?.records) return null;
    const offset = selectedDate.getTimezoneOffset();
    const adjustedDate = new Date(selectedDate.getTime() - (offset*60*1000));
    const dateStr = adjustedDate.toISOString().split('T')[0];
    
    const record = data.records.find(r => 
      (typeof r.classId === 'object' ? r.classId._id === classId : r.classId === classId) && 
      r.date === dateStr
    );
    return record ? record.status : null;
  };
  const timetableLabel = isToday ? 'Today' : selectedDayName;

  return (
    <div className="app-layout">
      <StudentSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {data?.student?.name || 'Student'}</p>
          </div>
        </div>

        {loading ? (
          <div className="loader">Loading your dashboard...</div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-left">
              <div>
                <div className="section-header">
                  <h3>My Classes</h3>
                </div>
                <div className="chic-list">
                  {allClasses.length > 0 ? Array.from(new Map(allClasses.map(item => [item.subjectCode, item])).values()).map((cls, idx) => (
                    <div key={idx} className="chic-list-item">
                      <div className="chic-list-code">{cls.subjectCode}</div>
                      <div className="chic-list-name">
                        {cls.subject}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 500 }}>
                          Prof. {cls.teacherId?.name?.replace('Prof. ', '').replace('Dr. ', '') || 'Teacher'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="chic-list-item">
                      <div className="chic-list-code">-</div>
                      <div className="chic-list-name">No classes enrolled</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="section-header">
                  <h3>Timetable for {timetableLabel}</h3>
                  <a href="/student/timetable">View All</a>
                </div>
                <div>
                  {displayClasses.length > 0 ? displayClasses.map(cls => (
                    <div key={cls._id} className="chic-timeline-item">
                      <div className="chic-timeline-time">{cls.startTime} - {cls.endTime}</div>
                      <div className="chic-timeline-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <div>
                          <div className="chic-timeline-title">{cls.subject}</div>
                          <div className="chic-timeline-subtitle">Lecturer: {cls.teacherId?.name || 'Teacher'} • {cls.room}</div>
                        </div>
                        {(() => {
                          const status = getAttendanceForClass(cls._id);
                          if (!status) return null;
                          let badgeClass = 'badge-gray';
                          let label = status;
                          if (status === 'present') { badgeClass = 'badge-green'; label = 'Present'; }
                          if (status === 'absent') { badgeClass = 'badge-red'; label = 'Absent'; }
                          if (status === 'duty_leave') { badgeClass = 'badge-blue'; label = 'Duty Leave'; }
                          return <span className={`badge ${badgeClass}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{label}</span>;
                        })()}
                      </div>
                    </div>
                  )) : (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                      <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                      </div>
                      <h3>Free Day</h3>
                      <p>You have no classes scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-right">
              <div className="chic-profile">
                <div className="chic-profile-avatar">
                  {data?.student?.name ? data.student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <h4>{data?.student?.name || 'Student Name'}</h4>
                <p>{data?.student?.course} - Sem {data?.student?.semester}</p>
              </div>

              <div className="calendar-widget">
                <div className="calendar-header">
                  <span>{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <span style={{ cursor: 'pointer', padding: '0 5px' }} onClick={prevMonth}>&lt;</span>
                    <span style={{ cursor: 'pointer', padding: '0 5px' }} onClick={nextMonth}>&gt;</span>
                  </div>
                </div>
                <div className="calendar-grid">
                  <div className="calendar-day-name">Su</div>
                  <div className="calendar-day-name">Mo</div>
                  <div className="calendar-day-name">Tu</div>
                  <div className="calendar-day-name">We</div>
                  <div className="calendar-day-name">Th</div>
                  <div className="calendar-day-name">Fr</div>
                  <div className="calendar-day-name">Sa</div>
                  
                  {calendarDays.map((d, i) => {
                    if (!d) return <div key={i} className="calendar-date" style={{ visibility: 'hidden' }}></div>;
                    const isSelected = d.getDate() === selectedDate.getDate() && 
                                       d.getMonth() === selectedDate.getMonth() && 
                                       d.getFullYear() === selectedDate.getFullYear();
                    return (
                      <div 
                        key={i} 
                        className={`calendar-date ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedDate(d)}
                        style={{ cursor: 'pointer' }}
                      >
                        {d.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="progress-widget">
                <div className="section-header" style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>Task Progress</h3>
                  <a href="/student/attendance">View All</a>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Overall Attendance</span>
                  <span style={{ fontWeight: 600 }}>{data?.summary?.attendancePercentage}</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: data?.summary?.attendancePercentage || '0%' }}></div>
                </div>
              </div>

              <div className="progress-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
                <div className="section-header" style={{ marginBottom: '0' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>My Notepad</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setNotes(''); localStorage.removeItem('studentNotes'); }}>Erase</span>
                </div>
                <textarea 
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Write your important things to do today..."
                  style={{ width: '100%', height: '100px', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', resize: 'none', fontFamily: 'inherit', fontSize: '0.9rem' }}
                ></textarea>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
