const API_BASE = '/api';

// Helper function for API calls
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
}

// Auth API
export const authAPI = {
    register: (userData) =>
        apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    login: (credentials) =>
        apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    getMe: () => apiFetch('/auth/me'),
};

// Subjects API
export const subjectsAPI = {
    getAll: () => apiFetch('/subjects'),

    getOne: (id) => apiFetch(`/subjects/${id}`),

    create: (subjectData) =>
        apiFetch('/subjects', {
            method: 'POST',
            body: JSON.stringify(subjectData),
        }),

    update: (id, subjectData) =>
        apiFetch(`/subjects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(subjectData),
        }),

    delete: (id) =>
        apiFetch(`/subjects/${id}`, {
            method: 'DELETE',
        }),
};

// Notes API
export const notesAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/notes${query ? `?${query}` : ''}`);
    },

    getOne: (id) => apiFetch(`/notes/${id}`),

    create: (noteData) =>
        apiFetch('/notes', {
            method: 'POST',
            body: JSON.stringify(noteData),
        }),

    update: (id, noteData) =>
        apiFetch(`/notes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(noteData),
        }),

    delete: (id) =>
        apiFetch(`/notes/${id}`, {
            method: 'DELETE',
        }),
};

// Tasks API
export const tasksAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/tasks${query ? `?${query}` : ''}`);
    },

    getUpcoming: () => apiFetch('/tasks/upcoming'),

    getStats: () => apiFetch('/tasks/stats'),

    getOne: (id) => apiFetch(`/tasks/${id}`),

    create: (taskData) =>
        apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        }),

    update: (id, taskData) =>
        apiFetch(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
        }),

    toggle: (id) =>
        apiFetch(`/tasks/${id}/toggle`, {
            method: 'PATCH',
        }),

    delete: (id) =>
        apiFetch(`/tasks/${id}`, {
            method: 'DELETE',
        }),
};
