import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { getDashboardStats, getClasses } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState(localStorage.getItem('teacherNotes') || '');
  const navigate = useNavigate();

  const initialNotifications = [
    { id: 1, type: 'NEW', text: 'Mid-term Exams Schedule Released', time: '2 hours ago' },
    { id: 2, type: 'NEW', text: 'Faculty Meeting at 4 PM in Main Hall', time: '5 hours ago' },
    { id: 3, type: 'INFO', text: 'Submit internal marks for Sem 5 by Friday', time: '1 day ago' }
  ];

  const [notificationsRead, setNotificationsRead] = useState(
    localStorage.getItem('notificationsRead') === 'true'
  );
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const handleViewAllNotifications = (e) => {
    e.preventDefault();
    setShowNotificationsModal(true);
    setNotificationsRead(true);
    localStorage.setItem('notificationsRead', 'true');
  };

  useEffect(() => {
    const fetchDashboardInfo = async () => {
      try {
        const [statsRes, classesRes] = await Promise.all([
          getDashboardStats(),
          getClasses()
        ]);
        setStats(statsRes.data);
        setAllClasses(classesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardInfo();
  }, []);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem('teacherNotes', e.target.value);
  };

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

  const days = generateCalendarDays();
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const selectedDayName = dayNames[selectedDate.getDay()];
  
  const isPastSemester = selectedDate.getFullYear() > 2026 || (selectedDate.getFullYear() === 2026 && selectedDate.getMonth() >= 11);
  const displayClasses = isPastSemester ? [] : allClasses.filter(c => c.day === selectedDayName);

  const isToday = selectedDate.getDate() === new Date().getDate() && 
                  selectedDate.getMonth() === new Date().getMonth() && 
                  selectedDate.getFullYear() === new Date().getFullYear();
  const timetableLabel = isToday ? 'Today' : selectedDayName;

  const isAttendanceAllowed = (dateObj, startTime) => {
    const now = new Date();
    const [hours, minutes] = startTime.split(':').map(Number);
    const classStartDateTime = new Date(dateObj);
    classStartDateTime.setHours(hours, minutes, 0, 0);
    
    const oneWeekLater = new Date(classStartDateTime);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    return now >= classStartDateTime && now <= oneWeekLater;
  };

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Faculty Dashboard</h1>
            <p>Overview of today's attendance and scheduled classes.</p>
          </div>
        </div>

        {loading ? (
          <div className="loader">Loading dashboard...</div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-left">
              <div>
                <div className="section-header">
                  <h3>Notifications</h3>
                  <a href="#" onClick={handleViewAllNotifications}>View All</a>
                </div>
                <div className="chic-list">
                  {initialNotifications.map(notif => (
                    <div key={notif.id} className="chic-list-item">
                      <div className="chic-list-code" style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
                        {notificationsRead ? (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.type === 'INFO' ? 'var(--text-muted)' : 'var(--primary)', display: 'inline-block', marginLeft: '12px' }}></span>
                        ) : (
                          notif.type === 'NEW' ? (
                            <span style={{ color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>NEW</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: '4px', color: 'var(--text-muted)' }}>{notif.type}</span>
                          )
                        )}
                      </div>
                      <div className="chic-list-name">{notif.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="section-header">
                  <h3>Timetable for {timetableLabel}</h3>
                  <a href="/teacher/timetable">View All</a>
                </div>
                <div>
                  {displayClasses.length > 0 ? displayClasses.map(cls => {
                    const allowed = isAttendanceAllowed(selectedDate, cls.startTime);
                    return (
                      <div key={cls._id} className="chic-timeline-item">
                        <div className="chic-timeline-time" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px' }}>
                          <span>{cls.startTime} - {cls.endTime}</span>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => navigate(`/teacher/attendance/${cls._id}`)}
                            disabled={!allowed}
                            style={{ opacity: allowed ? 1 : 0.5, cursor: allowed ? 'pointer' : 'not-allowed', width: '100%', padding: '0.4rem 0', fontSize: '0.8rem' }}
                          >
                            {allowed ? 'Take Attendance' : 'Locked'}
                          </button>
                        </div>
                        <div className="chic-timeline-content">
                          <div className="chic-timeline-title">{cls.subject}</div>
                          <div className="chic-timeline-subtitle">{cls.course} • Section {cls.section} • {cls.room}</div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="empty-state" style={{ padding: '2rem' }}>
                      <div className="empty-state-icon" style={{ marginBottom: '1rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                      </div>
                      <h3>Free Day</h3>
                      <p>You have no classes scheduled.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-right">
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
                  
                  {days.map((d, i) => {
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

              <div className="progress-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="section-header" style={{ marginBottom: '0' }}>
                  <h3 style={{ fontSize: '1.1rem' }}>My Notepad</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => { setNotes(''); localStorage.removeItem('teacherNotes'); }}>Erase</span>
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

      {showNotificationsModal && (
        <div className="modal-overlay" onClick={() => setShowNotificationsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>All Notifications</h2>
              <button className="modal-close" onClick={() => setShowNotificationsModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="chic-list">
                {initialNotifications.map(notif => (
                  <div key={notif.id} className="chic-list-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="chic-list-name" style={{ fontWeight: 500 }}>{notif.text}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>{notif.time}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowNotificationsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
