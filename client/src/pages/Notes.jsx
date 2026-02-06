import { useState, useEffect } from 'react';
import { notesAPI, subjectsAPI } from '../services/api';
import Modal from '../components/Modal';
import './Notes.css';

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // View Modal
    const [viewNote, setViewNote] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Filter notes locally for search instant feedback
    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    const loadData = async () => {
        try {
            const [notesRes, subjectsRes] = await Promise.all([
                notesAPI.getAll(),
                subjectsAPI.getAll()
            ]);
            setNotes(notesRes.data);
            setSubjects(subjectsRes.data);

            if (subjectsRes.data.length > 0) {
                setFormData(prev => ({ ...prev, subject: subjectsRes.data[0]._id }));
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingNote(null);
        setFormData({
            title: '',
            content: '',
            subject: subjects.length > 0 ? subjects[0]._id : ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (note, e) => {
        e.stopPropagation();
        setEditingNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            subject: note.subject._id
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingNote) {
                await notesAPI.update(editingNote._id, formData);
            } else {
                await notesAPI.create(formData);
            }
            await loadData();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Delete this note?')) return;
        try {
            setNotes(notes.filter(n => n._id !== id));
            await notesAPI.delete(id);
            if (viewNote && viewNote._id === id) setViewNote(null);
        } catch (error) {
            loadData();
        }
    };

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div></div>;

    return (
        <div className="container page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notes</h1>
                    <p className="page-subtitle">Capture your ideas and study material</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    + New Note
                </button>
            </div>

            <div className="notes-controls">
                <input
                    type="text"
                    placeholder="Search notes..."
                    className="form-input search-bar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="notes-grid">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map(note => (
                        <div key={note._id} className="note-card" onClick={() => setViewNote(note)}>
                            <div className="note-card-header">
                                <span className="note-subject" style={{ color: note.subject?.color }}>
                                    {note.subject?.icon} {note.subject?.name}
                                </span>
                                <span className="note-date">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="note-title">{note.title}</h3>
                            <p className="note-preview">
                                {note.content.substring(0, 100)}
                                {note.content.length > 100 ? '...' : ''}
                            </p>

                            <div className="note-actions">
                                <button
                                    className="btn-icon action-btn edit-btn"
                                    onClick={(e) => openEditModal(note, e)}
                                >
                                    ✎
                                </button>
                                <button
                                    className="btn-icon action-btn delete-btn"
                                    onClick={(e) => handleDelete(note._id, e)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3 className="empty-state-title">No notes found</h3>
                        <p className="empty-state-text">Start writing something down!</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingNote ? 'Edit Note' : 'Create Note'}
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Note'}
                        </button>
                    </>
                }
            >
                <form className="note-form">
                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <select
                            className="form-select"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            required
                        >
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            className="form-input"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Note Title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                            className="form-textarea note-editor"
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Start typing..."
                            required
                        />
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal
                isOpen={!!viewNote}
                onClose={() => setViewNote(null)}
                title={viewNote?.title}
                footer={
                    <button className="btn btn-secondary" onClick={() => setViewNote(null)}>Close</button>
                }
            >
                <div className="view-note-content">
                    <div className="view-note-meta">
                        <span className="task-tag" style={{ color: viewNote?.subject?.color }}>
                            {viewNote?.subject?.icon} {viewNote?.subject?.name}
                        </span>
                        <span className="text-secondary">
                            Updated: {viewNote && new Date(viewNote.updatedAt).toLocaleString()}
                        </span>
                    </div>
                    <div className="note-body">
                        {viewNote?.content}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
