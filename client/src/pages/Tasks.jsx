import { useState, useEffect } from 'react';
import { tasksAPI, subjectsAPI } from '../services/api';
import Modal from '../components/Modal';
import './Tasks.css';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, completed

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        dueDate: '',
        priority: 'medium',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tasksRes, subjectsRes] = await Promise.all([
                tasksAPI.getAll(),
                subjectsAPI.getAll()
            ]);
            setTasks(tasksRes.data);
            setSubjects(subjectsRes.data);

            // Set default subject if available
            if (subjectsRes.data.length > 0) {
                setFormData(prev => ({ ...prev, subject: subjectsRes.data[0]._id }));
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await tasksAPI.create(formData);
            await loadData(); // Refresh list to get populated subject
            setIsModalOpen(false);
            // Reset form (keep subject)
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium'
            }));
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (task) => {
        try {
            // Optimistic update
            setTasks(tasks.map(t =>
                t._id === task._id ? { ...t, isCompleted: !t.isCompleted } : t
            ));
            await tasksAPI.toggle(task._id);
        } catch (error) {
            // Revert if failed
            loadData();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            setTasks(tasks.filter(t => t._id !== id));
            await tasksAPI.delete(id);
        } catch (error) {
            loadData();
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'pending') return !task.isCompleted;
        if (filter === 'completed') return task.isCompleted;
        return true;
    });

    const getPriorityColor = (p) => {
        if (p === 'high') return 'badge-danger';
        if (p === 'medium') return 'badge-warning';
        return 'badge-success';
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tasks</h1>
                    <p className="page-subtitle">Track your assignments and deadlines</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    + New Task
                </button>
            </div>

            {/* Filters */}
            <div className="tasks-filter">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button
                    className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>

            {/* Task List */}
            <div className="tasks-list-container">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <div key={task._id} className={`task-card ${task.isCompleted ? 'completed' : ''}`}>
                            <div
                                className="task-checkbox-area"
                                onClick={() => handleToggle(task)}
                            >
                                <div className={`checkbox ${task.isCompleted ? 'checked' : ''}`}>
                                    {task.isCompleted && '✓'}
                                </div>
                            </div>

                            <div className="task-main-content">
                                <div className="task-header-row">
                                    <h3 className={`task-name ${task.isCompleted ? 'strike' : ''}`}>
                                        {task.title}
                                    </h3>
                                    <span className={`badge ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>

                                <p className="task-desc">{task.description}</p>

                                <div className="task-meta-row">
                                    <span className="task-tag" style={{ color: task.subject?.color }}>
                                        {task.subject?.icon} {task.subject?.name}
                                    </span>
                                    {task.dueDate && (
                                        <span className="task-tag">
                                            📅 {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                className="btn-icon delete-task-btn"
                                onClick={() => handleDelete(task._id)}
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">✨</div>
                        <h3 className="empty-state-title">No tasks found</h3>
                        <p className="empty-state-text">You're all caught up!</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Task"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Create Task'}
                        </button>
                    </>
                }
            >
                <form className="task-form">
                    <div className="form-group">
                        <label className="form-label">Task Title</label>
                        <input
                            className="form-input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Finish Calculus Homework"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Subject</label>
                            <select
                                className="form-select"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Due Date (Optional)</label>
                        <input
                            type="date"
                            className="form-input"
                            value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description (Optional)</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            style={{ minHeight: '80px' }}
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
