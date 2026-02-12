/**
 * API configuration and service layer for the Task Tracker app.
 * All HTTP communication with the Flask backend lives here.
 */

import axios from 'axios';
import { Platform } from 'react-native';

// Using localhost — works on physical devices via 'adb reverse tcp:5000 tcp:5000'
// For emulators without adb reverse: use 'http://10.0.2.2:5000'
const BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
});

// ── Tasks ───────────────────────────────────────────────────────────────────

/** Fetch every task (includes notesCount & latestNote). Optional status filter. */
export const fetchTasks = async (status = null) => {
    const params = status ? { status } : {};
    const { data } = await api.get('/tasks', { params });
    return data;
};

/** Fetch a single task by ID. */
export const fetchTask = async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}`);
    return data;
};

/** Create a new task. */
export const createTask = async ({ title, description, status, startTime, finishBy, dueDate, reminderEnabled }) => {
    const { data } = await api.post('/tasks', { title, description, status, startTime, finishBy, dueDate, reminderEnabled });
    return data;
};

/** Update a task (status, title, description, dueDate, reminderEnabled). */
export const updateTask = async (taskId, updates) => {
    const { data } = await api.patch(`/tasks/${taskId}`, updates);
    return data;
};

// ── Notes ───────────────────────────────────────────────────────────────────

/** Fetch all notes for a task (chronological). */
export const fetchNotes = async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}/notes`);
    return data;
};

/** Add a progress note to a task. Optionally mark the task complete. */
export const addNote = async (taskId, { content, markComplete = false }) => {
    const { data } = await api.post(`/tasks/${taskId}/notes`, {
        content,
        markComplete,
    });
    return data;
};

// ── AI ──────────────────────────────────────────────────────────────────────

/** Get AI recommendations for a task. */
export const fetchAIRecommendation = async (taskId) => {
    const { data } = await api.post(`/tasks/${taskId}/ai-recommend`);
    return data;
};

/** Send a message to the AI chat. */
export const sendChatMessage = async (message, history = []) => {
    const { data } = await api.post('/chat', { message, history });
    return data;
};

// ── Profile ─────────────────────────────────────────────────────────────────

/** Get user profile with stats. */
export const fetchProfile = async () => {
    const { data } = await api.get('/profile');
    return data;
};

/** Update user profile. */
export const updateProfile = async ({ name, avatar }) => {
    const { data } = await api.post('/profile', { name, avatar });
    return data;
};

export default api;
