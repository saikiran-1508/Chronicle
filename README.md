# Chronicle

A modern, full-featured **Task Tracker** mobile app built with **React Native** and a **Flask** backend. Chronicle helps you create, track, and manage tasks with scheduling, progress notes, AI-powered insights, smart reminders, and a beautiful dark/light theme.

---

## ✨ Features

### 📋 Task Management
- Create tasks with **title**, **description**, **start time**, and **finish by** deadline
- Track tasks through statuses: **Pending → Active → Completed**
- Auto-status logic: tasks become active at their start time, overdue if past the deadline
- Filter tasks by status (All, Pending, Active, Done)
- Pull-to-refresh task list

### 📝 Progress Notes
- Add timestamped progress notes to any task
- Optionally mark a task as complete when adding a note
- View full note history on the task detail screen

### 🤖 AI-Powered Insights
- **AI Recommendations** — Get task analysis with next steps, time estimates, and potential blockers (powered by **Gemini API**)
- **AI Chat** — Chat with an AI assistant that has full context of your tasks for planning and productivity advice

### 🔔 Smart Reminders
- Enable "Remind me at start time" when creating a task
- Set/cancel reminders from the task detail screen
- Local push notifications fire at the scheduled start time
- Customizable reminder sounds in profile settings

### 👤 User Profile
- Editable display name and avatar (emoji characters or photo upload)
- Task statistics dashboard (Total, Active, Pending, Done)
- Active and completed task history
- **Reminder Sound picker** — choose from default sounds or upload from device

### 🔐 Authentication
- Email/Password sign up and sign in
- Google Sign-In via Firebase
- Persistent auth state across sessions

### 🎨 Theming
- Light and Dark mode with toggle
- Persisted theme preference
- Consistent black & white minimalist design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native 0.83.1 |
| **Navigation** | React Navigation (Native Stack) |
| **Auth** | Firebase Authentication + Google Sign-In |
| **State** | React Context API |
| **Storage** | AsyncStorage (theme, sound prefs) |
| **Notifications** | @notifee/react-native |
| **Backend** | Flask (Python) |
| **AI** | Google Gemini API (gemini-2.5-flash) |
| **HTTP Client** | Axios |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.8
- **Android Studio** with SDK & emulator (or a physical device)
- **React Native CLI** environment set up ([guide](https://reactnative.dev/docs/set-up-your-environment))

### 1. Clone the Repository

```bash
git clone https://github.com/saikiran-1508/Chronicle.git
cd Chronicle
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 4. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** and **Google** sign-in methods
3. Download `google-services.json` and place it in `android/app/`
4. Update the `webClientId` in `src/context/AuthContext.js` with your Firebase project's Web client ID

### 5. Configure Gemini API Key

Set your Gemini API key in `backend/groq_service.py`:

```python
GEMINI_API_KEY = "your-api-key-here"
```

Or set it as an environment variable:

```bash
set GEMINI_API_KEY=your-api-key-here
```

Get a free key at [aistudio.google.com](https://aistudio.google.com/app/apikey).

### 6. Start the Backend Server

```bash
cd backend
python app.py
```

The API will be available at `http://localhost:5000`.

### 7. Connect Device (Android)

For a physical device connected via USB:

```bash
adb reverse tcp:5000 tcp:5000
```

### 8. Run the App

```bash
# Start Metro bundler
npm start

# In another terminal, build and run on Android
npm run android
```

---

## 📁 Project Structure

```
Chronicle/
├── App.js                          # Root component — navigation setup, auth/theme providers
├── index.js                        # App entry point
├── package.json                    # Dependencies and scripts
├── babel.config.js                 # Babel configuration
├── metro.config.js                 # Metro bundler configuration
├── app.json                        # App metadata
│
├── backend/                        # Flask API backend
│   ├── app.py                      # REST API — tasks, notes, AI, chat, profile endpoints
│   ├── groq_service.py             # Gemini AI integration for recommendations and chat
│   └── requirements.txt            # Python dependencies (flask, flask-cors)
│
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── EmptyState.js           # Empty list placeholder
│   │   ├── ErrorState.js           # Error display with retry button
│   │   ├── LoadingState.js         # Loading spinner
│   │   └── StatusBadge.js          # Task status badge (pending/active/completed)
│   │
│   ├── constants/                  # App-wide constants
│   │   ├── colors.js               # Color palette
│   │   ├── screens.js              # Screen name constants
│   │   ├── index.js                # Constants barrel export
│   │   └── reminderSounds.js       # Default reminder sound options
│   │
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.js          # Firebase auth state (sign in/up, Google, sign out)
│   │   └── ThemeContext.js         # Light/dark theme with AsyncStorage persistence
│   │
│   ├── navigation/                 # Navigation config
│   │   └── AppNavigator.js         # Stack navigator setup
│   │
│   ├── screens/                    # App screens
│   │   ├── SignInScreen.js         # Email/password + Google sign in
│   │   ├── SignUpScreen.js         # New account registration
│   │   ├── TaskListScreen.js       # Main task list with filters and FAB
│   │   ├── CreateTaskScreen.js     # New task form with scheduling and reminder toggle
│   │   ├── TaskDetailScreen.js     # Task details, schedule, status actions, AI insights, notes
│   │   ├── AddNoteScreen.js        # Add progress note to a task
│   │   ├── ChatScreen.js           # AI chat assistant
│   │   └── ProfileScreen.js        # User profile, stats, avatar picker, sound settings
│   │
│   ├── services/                   # API and service layer
│   │   ├── api.js                  # Axios HTTP client for all backend endpoints
│   │   └── ReminderService.js      # Local push notification scheduling and sound preferences
│   │
│   └── types/                      # TypeScript type definitions
│       └── index.js                # Shared types
│
├── android/                        # Android native project
└── ios/                            # iOS native project
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List all tasks (optional `?status=` filter) |
| `GET` | `/tasks/:id` | Get a single task |
| `POST` | `/tasks` | Create a new task |
| `PATCH` | `/tasks/:id` | Update a task |
| `GET` | `/tasks/:id/notes` | List notes for a task |
| `POST` | `/tasks/:id/notes` | Add a progress note |
| `POST` | `/tasks/:id/ai-recommend` | Get AI recommendations |
| `POST` | `/chat` | AI chat with task context |
| `GET` | `/profile` | Get user profile with stats |
| `POST` | `/profile` | Update profile (name, avatar, reminderSound) |

---

## 📸 App Flow

1. **Sign In / Sign Up** → Firebase authentication
2. **Task List** → View, filter, and manage all tasks
3. **Create Task** → Set title, description, schedule, and reminder
4. **Task Detail** → View progress, set reminders, get AI insights, add notes
5. **AI Chat** → Get productivity advice with full task context
6. **Profile** → Edit avatar, view stats, configure reminder sounds

---

## 📄 License

This project is private and not licensed for public distribution.
