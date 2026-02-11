# Task Tracker with Progress Notes

A full-stack mobile application built with **React Native CLI** and **Flask**. Users can manage tasks and track progress by adding timestamped notes to each task.

## Project Structure

```
internapp/
├── backend/
│   ├── app.py                  # Flask API server (all endpoints)
│   └── requirements.txt        # Python dependencies
├── mobile/
│   ├── index.js                # RN CLI entry point
│   ├── App.js                  # Root component & navigation setup
│   ├── app.json                # App name configuration
│   ├── package.json            # Node dependencies
│   ├── babel.config.js
│   ├── metro.config.js         # Metro bundler config
│   └── src/
│       ├── services/
│       │   └── api.js          # Axios HTTP client & API functions
│       ├── screens/
│       │   ├── TaskListScreen.js      # Screen 1 — list all tasks
│       │   ├── TaskDetailScreen.js    # Screen 2 — task info + notes
│       │   ├── AddNoteScreen.js       # Screen 3 — add progress note
│       │   └── CreateTaskScreen.js    # Bonus  — create new task
│       └── components/
│           ├── LoadingState.js  # Reusable loading spinner
│           ├── ErrorState.js    # Reusable error + retry
│           ├── StatusBadge.js   # Status chip (pending/in-progress/completed)
│           └── EmptyState.js    # Empty list placeholder
└── README.md
```

## Features

| Screen | Description |
|--------|-------------|
| **Task List** | Displays all tasks with status badge, latest note preview, and note count. Pull-to-refresh supported. |
| **Task Detail** | Shows full task details and all progress notes in chronological order. |
| **Add Note** | Multiline text input for adding a progress note. Optional checkbox to mark the task as complete. |
| **Create Task** | Form to create a new task with title and description. |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native CLI |
| Navigation | React Navigation (Native Stack) |
| HTTP Client | Axios |
| Backend | Flask (Python) |
| Data Store | In-memory (Python dicts) |
| CORS | flask-cors |

---

## Getting Started

### Prerequisites

- **Python 3.9+** — for the Flask backend
- **Node.js 18+** and **npm** — for the React Native app
- **Android Studio** (for Android) or **Xcode** (for iOS) — with an emulator configured
- React Native CLI environment set up ([official guide](https://reactnative.dev/docs/set-up-your-environment))

### 1. Start the Flask Backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

The API will be available at **http://localhost:5000**. Five sample tasks with notes are seeded automatically.

### 2. Start the React Native App

```bash
cd mobile

# Install dependencies
npm install

# Start Metro bundler
npm start

# In a separate terminal — run on Android
npm run android

# Or run on iOS (macOS only)
npm run ios
```

> **Note for physical devices:** Open `src/services/api.js` and change `BASE_URL` to your computer's local IP address (e.g. `http://192.168.1.42:5000`).

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List all tasks (includes `notesCount`, `latestNote`) |
| `GET` | `/tasks/:id` | Get single task details |
| `POST` | `/tasks` | Create a new task (`{ title, description? }`) |
| `PATCH` | `/tasks/:id` | Update task fields (`{ status?, title?, description? }`) |
| `GET` | `/tasks/:id/notes` | List all notes for a task |
| `POST` | `/tasks/:id/notes` | Add a note (`{ content, markComplete? }`) |

### Status values

`pending` · `in-progress` · `completed`

---

## Data Models

**Task**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "pending | in-progress | completed",
  "createdAt": "ISO 8601",
  "notesCount": 0,
  "latestNote": "string | null"
}
```

**Note**
```json
{
  "id": "uuid",
  "taskId": "uuid",
  "content": "string",
  "createdAt": "ISO 8601"
}
```

---

## Key Design Decisions

1. **In-memory storage** — Keeps the backend simple with no database setup. Data resets on server restart; seed data is loaded on boot.
2. **Centralised API layer** — All HTTP calls go through `src/services/api.js` so screens never import Axios directly.
3. **Reusable components** — `LoadingState`, `ErrorState`, `StatusBadge`, and `EmptyState` are shared across screens.
4. **Pull-to-refresh & focus-reload** — Task list and detail screens re-fetch data when the screen regains focus, keeping data fresh.
5. **Platform-aware base URL** — Android emulator uses `10.0.2.2` to reach host localhost; iOS/web use `localhost` directly.
