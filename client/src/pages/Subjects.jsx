import { useState, useEffect } from 'react';
import { subjectsAPI } from '../services/api';
import Modal from '../components/Modal';
import './Subjects.css';

export default function Subjects() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', color: '#6366f1', icon: '📚' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    const loadSubjects = async () => {
        try {
            const response = await subjectsAPI.getAll();
            setSubjects(response.data);
        } catch (error) {
            console.error('Failed to load subjects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await subjectsAPI.create(formData);
            await loadSubjects();
            setIsModalOpen(false);
            setFormData({ name: '', color: '#6366f1', icon: '📚' });
        } catch (error) {
            console.error('Failed to create subject', error);
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm('Are you sure? This will delete all notes and tasks for this subject.')) return;

        try {
            await subjectsAPI.delete(id);
            loadSubjects();
        } catch (error) {
            console.error('Failed to delete subject', error);
        }
    };

    const colors = [
        '#6366f1', '#ef4444', '#f59e0b', '#10b981',
        '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'
    ];

    const icons = ['📚', '📐', '🔬', '💻', '🎨', '🌍', '📝', '⚡'];

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Subjects</h1>
                    <p className="page-subtitle">Manage your courses and subjects</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    + New Subject
                </button>
            </div>

            <div className="subjects-grid">
                {subjects.map(subject => (
                    <div key={subject._id} className="subject-card" style={{ borderTopColor: subject.color }}>
                        <div className="subject-header">
                            <span className="subject-icon-lg">{subject.icon}</span>
                            <button
                                className="btn-icon delete-btn"
                                onClick={(e) => handleDelete(subject._id, e)}
                                title="Delete Subject"
                            >
                                🗑️
                            </button>
                        </div>
                        <h3 className="subject-card-title">{subject.name}</h3>
                        <div className="subject-stats">
                            <div className="stat-pill">
                                <span>📝</span> {subject.noteCount || 0} Notes
                            </div>
                            <div className="stat-pill">
                                <span>✅</span> {subject.taskCount || 0} Tasks
                            </div>
                        </div>
                    </div>
                ))}

                {subjects.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <h3 className="empty-state-title">No subjects yet</h3>
                        <p className="empty-state-text">Add your first subject to start organizing notes and tasks.</p>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            Create Subject
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Subject"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Creating...' : 'Create Subject'}
                        </button>
                    </>
                }
            >
                <form id="subject-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Subject Name</label>
                        <input
                            className="form-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Mathematics"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <div className="color-picker">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`color-swatch ${formData.color === c ? 'selected' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setFormData({ ...formData, color: c })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Icon</label>
                        <div className="icon-picker">
                            {icons.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    className={`icon-swatch ${formData.icon === icon ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, icon: icon })}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
