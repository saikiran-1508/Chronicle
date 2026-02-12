# Chronicle: Intelligent Task Manager

## Project Overview

Chronicle is a modern, AI-powered task management system designed to streamline personal productivity. It combines a high-performance React Native Android application with a flexible Python Flask backend. The core philosophy is to go beyond simple to-do lists by integrating intelligent features like AI-driven task recommendations, a context-aware chat assistant, and smart scheduling mechanisms.

## Implementation Details

### Frontend Architecture (React Native)
The mobile application is built using React Native CLI, ensuring native performance on Android devices. It utilizes a component-based architecture with a centralized theme and authentication context. Key libraries include `@notifee/react-native` for robust local push notifications, `react-native-vector-icons` for UI elements, and `axios` for seamless API communication. The UI is designed with a focus on aesthetics, featuring dark/light mode toggles and smooth transitions.

### Backend Infrastructure (Python Flask)
The backend is a lightweight yet powerful Flask server that handles data persistence and business logic. Currently using an in-memory data structure for speed during development, it is architected to easily switch to a persistent SQL database for production. It exposes RESTful endpoints for task management (CRUD operations), note-taking, and user profile management.

### AI Integration
Intelligence is powered by the Groq API (utilizing Llama 3 models), which provides real-time analysis of user tasks. This integration allows the app to offer personalized suggestions, break down complex goals into actionable steps, and provide a conversational interface for users to query their schedule and productivity patterns.

## Development Commands

To run the project locally, follow these steps:

### 1. Start the Backend Server
Navigate to the backend directory and run the Flask application. This starts the API server on port 5000.
```bash
cd backend
python app.py
```

### 2. Configure Android Connectivity
If running on a physical Android device via USB, you must reverse the port so the phone can access the computer's localhost.
```bash
adb reverse tcp:5000 tcp:5000
```

### 3. Run the Android App
Launch the application on your connected device or emulator. This command builds the debug APK and installs it.
```bash
npx react-native run-android
```

### 4. Build Release APK
To generate a signed APK for distribution, navigate to the android directory and run the Gradle assemble command.
```bash
cd android
./gradlew assembleRelease
```
The output APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`
