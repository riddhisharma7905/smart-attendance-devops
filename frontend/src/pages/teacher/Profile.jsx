import { useAuth } from '../../context/AuthContext';
import TeacherSidebar from '../../components/TeacherSidebar';

export default function TeacherProfile() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Faculty Profile</h1>
            <p>Manage your account settings.</p>
          </div>
        </div>

        <div className="auth-card" style={{ maxWidth: '600px', margin: '0' }}>
          <div className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={user?.name || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user?.email || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value="Professor / Teacher" readOnly style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
