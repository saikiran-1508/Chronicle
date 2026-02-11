/**
 * Data type definitions for Task Tracker.
 * These mirror the shapes returned by the Flask API.
 */

/**
 * @typedef {Object} Task
 * @property {string} id           - Unique identifier (UUID)
 * @property {string} title        - Task title
 * @property {string} description  - Task description
 * @property {'pending'|'in-progress'|'completed'} status
 * @property {string} createdAt    - ISO 8601 timestamp
 * @property {number} notesCount   - Number of notes attached
 * @property {string|null} latestNote - Preview of the most recent note
 */

/**
 * @typedef {Object} Note
 * @property {string} id        - Unique identifier (UUID)
 * @property {string} taskId    - Parent task ID
 * @property {string} content   - Note text content
 * @property {string} createdAt - ISO 8601 timestamp
 */

/**
 * @typedef {'pending'|'in-progress'|'completed'} TaskStatus
 */

// Export as empty object so this file can be imported for JSDoc references
export default {};
