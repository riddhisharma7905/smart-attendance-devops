import { useEffect, useState } from 'react';
import StudentSidebar from '../../components/StudentSidebar';
import { getMyAttendance } from '../../services/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyAttendance();
        setProfile(res.data.student);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="app-layout">
      <StudentSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>My Profile</h1>
            <p>View your academic details.</p>
          </div>
        </div>

        <div className="auth-card" style={{ maxWidth: '600px', margin: '0' }}>
          {loading ? (
            <div className="loader">Loading profile...</div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={profile?.name || ''} readOnly />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number</label>
                  <input type="text" value={profile?.rollNumber || ''} readOnly />
                </div>
                <div className="form-group">
                  <label>Course</label>
                  <input type="text" value={profile?.course || ''} readOnly />
                </div>
              </div>
              <div className="form-group">
                <label>Semester</label>
                <input type="text" value={profile?.semester ? `Semester ${profile.semester}` : ''} readOnly />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
