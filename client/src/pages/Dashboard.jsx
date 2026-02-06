import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, subjectsAPI, notesAPI } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        upcomingTasks: [],
        subjects: [],
        recentNotes: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [tasksRes, subjectsRes, notesRes] = await Promise.all([
                    tasksAPI.getUpcoming(),
                    subjectsAPI.getAll(),
                    notesAPI.getAll()
                ]);

                setStats({
                    upcomingTasks: tasksRes.data,
                    subjects: subjectsRes.data,
                    recentNotes: notesRes.data.slice(0, 5) // Get latest 5 notes
                });
            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard container">
            <header className="dashboard-header">
                <div>
                    <h1 className="welcome-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                    <p className="welcome-subtitle">Here's what's on your plate today.</p>
                </div>
                <div className="date-display">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">📚</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.subjects.length}</span>
                        <span className="stat-label">Subjects</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">📝</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.recentNotes.length}</span>
                        <span className="stat-label">Total Notes</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">⚡</div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.upcomingTasks.length}</span>
                        <span className="stat-label">Upcoming Tasks</span>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                {/* Upcoming Tasks Section */}
                <section className="dashboard-section tasks-section">
                    <div className="section-header">
                        <h2 className="section-title">Upcoming Deadlines</h2>
                        <Link to="/tasks" className="btn btn-sm btn-ghost">View All</Link>
                    </div>

                    <div className="task-list">
                        {stats.upcomingTasks.length > 0 ? (
                            stats.upcomingTasks.slice(0, 4).map(task => (
                                <div key={task._id} className="task-item">
                                    <div className={`priority-indicator ${task.priority}`}></div>
                                    <div className="task-content">
                                        <p className="task-title">{task.title}</p>
                                        <div className="task-meta">
                                            <span className="task-subject" style={{ color: task.subject.color }}>
                                                {task.subject.icon} {task.subject.name}
                                            </span>
                                            <span className="task-date">
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="btn-icon check-btn" title="Complete (Go to Tasks)">
                                        ✓
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state-mini">
                                <p>No upcoming tasks! 🎉</p>
                                <Link to="/tasks" className="btn btn-sm btn-primary">Add Task</Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Subjects & Quick Notes Section */}
                <section className="dashboard-section">
                    <div className="section-header">
                        <h2 className="section-title">Your Subjects</h2>
                        <Link to="/subjects" className="btn btn-sm btn-ghost">Manage</Link>
                    </div>

                    <div className="subjects-grid-mini">
                        {stats.subjects.length > 0 ? (
                            stats.subjects.map(subject => (
                                <Link to={`/notes?subject=${subject._id}`} key={subject._id} className="subject-card-mini" style={{ borderColor: subject.color }}>
                                    <span className="subject-icon">{subject.icon}</span>
                                    <span className="subject-name">{subject.name}</span>
                                    <span className="subject-badge">{subject.noteCount || 0} notes</span>
                                </Link>
                            ))
                        ) : (
                            <div className="empty-state-mini">
                                <p>No subjects yet.</p>
                                <Link to="/subjects" className="btn btn-sm btn-primary">Add Subject</Link>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
