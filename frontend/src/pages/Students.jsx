import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getStudents, addStudent, updateStudent, deleteStudent } from '../services/api';
const emptyForm = { name: '', rollNumber: '', email: '', course: '', semester: '' };
export default function Students() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await getStudents();
      setStudents(data.students);
      setFiltered(data.students);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      students.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q)
      )
    );
  }, [search, students]);
  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormError('');
    setShowModal(true);
  };
  const openEditModal = (student) => {
    setForm({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      course: student.course,
      semester: student.semester,
    });
    setEditingId(student._id);
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const flashSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, rollNumber, email, course, semester } = form;
    if (!name || !rollNumber || !email || !course || !semester) {
      setFormError('All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateStudent(editingId, { ...form, semester: Number(form.semester) });
        flashSuccess('Student updated successfully.');
      } else {
        await addStudent({ ...form, semester: Number(form.semester) });
        flashSuccess('Student added successfully.');
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteStudent(id);
      flashSuccess('Student deleted successfully.');
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Students</h1>
            <p>Manage all enrolled students.</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>+ Add Student</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <div className="table-card">
          <div className="table-toolbar">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, roll no, email, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="count-badge">{filtered.length} students</span>
          </div>
          {loading ? (
            <div className="loader">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">No students found.</div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id}>
                      <td><span className="badge">{s.rollNumber}</span></td>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.course}</td>
                      <td>Sem {s.semester}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-sm btn-edit" onClick={() => openEditModal(s)}>Edit</button>
                          <button className="btn btn-sm btn-delete" onClick={() => handleDelete(s._id, s.name)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Student' : 'Add Student'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {formError && <div className="alert alert-error">{formError}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Roll Number</label>
                  <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="CS2024001" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@college.com" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Course</label>
                  <input name="course" value={form.course} onChange={handleChange} placeholder="B.Tech CSE" />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select name="semester" value={form.semester} onChange={handleChange}>
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}