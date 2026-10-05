import { useEffect, useState } from 'react';
import TeacherSidebar from '../../components/TeacherSidebar';
import { getStudents, deleteStudent } from '../../services/api';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    try {
      const { data } = await getStudents();
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <TeacherSidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Student Management</h1>
            <p>View and manage all registered students.</p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-toolbar">
            <div className="form-group" style={{ margin: 0, width: '300px' }}>
              <input 
                type="text" 
                placeholder="Search students..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Note: Students must self-register via the Signup page.
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loader">Loading students...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Sem</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student._id}>
                      <td>{student.rollNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.course}</td>
                      <td>{student.semester}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleDelete(student._id)} style={{ color: 'var(--danger)' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-state">
                        <div className="empty-state-icon">👨‍🎓</div>
                        <h3>No students found</h3>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
