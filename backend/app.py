"""
Task Tracker API - Flask Backend
In-memory data store with REST endpoints for tasks, progress notes, AI features,
chat, profile, and reminders.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timezone
import uuid

from groq_service import get_task_recommendations, chat_with_context

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# In-memory data store
# ---------------------------------------------------------------------------
tasks: dict[str, dict] = {}
notes: dict[str, dict] = {}
profile: dict = {
    "name": "User",
    "avatar": "😊",
}
chat_history: list[dict] = []


def seed_data():
    """Populate the store with sample tasks and notes for demo purposes."""
    sample_tasks = [
        {
            "title": "Design Login Screen",
            "description": "Create wireframes and final UI design for the login screen including email/password fields, social login buttons, and forgot password link.",
            "status": "in-progress",
        },
        {
            "title": "Set Up CI/CD Pipeline",
            "description": "Configure GitHub Actions for automated testing and deployment to staging environment.",
            "status": "pending",
        },
        {
            "title": "Write Unit Tests for Auth Module",
            "description": "Achieve at least 80% code coverage for the authentication module including login, signup, and token refresh flows.",
            "status": "completed",
        },
        {
            "title": "Implement Push Notifications",
            "description": "Integrate Firebase Cloud Messaging for push notifications on both iOS and Android platforms.",
            "status": "pending",
        },
        {
            "title": "API Rate Limiting",
            "description": "Add rate limiting middleware to protect API endpoints from abuse. Configure limits per user and per IP.",
            "status": "in-progress",
        },
    ]

    sample_notes = {
        0: [
            "Started working on the wireframes using Figma. Initial layout drafted.",
            "Completed mobile-first wireframe. Moving on to tablet and desktop breakpoints.",
            "Received feedback from the design team. Need to revise the color palette.",
        ],
        1: [
            "Researched GitHub Actions vs GitLab CI. Going with GitHub Actions.",
        ],
        2: [
            "Wrote tests for login and signup flows.",
            "Added edge case tests for token expiry and refresh.",
            "All tests passing. Coverage at 87%.",
        ],
        4: [
            "Reviewing express-rate-limit package documentation.",
            "Implemented basic rate limiting — 100 requests per 15 minutes per IP.",
        ],
    }

    for i, t in enumerate(sample_tasks):
        task_id = str(uuid.uuid4())
        tasks[task_id] = {
            "id": task_id,
            "title": t["title"],
            "description": t["description"],
            "status": t["status"],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "startTime": t.get("startTime"),
            "finishBy": t.get("finishBy"),
            "dueDate": None,
            "reminderEnabled": False,
        }

        if i in sample_notes:
            for note_text in sample_notes[i]:
                note_id = str(uuid.uuid4())
                notes[note_id] = {
                    "id": note_id,
                    "taskId": task_id,
                    "content": note_text,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def get_notes_for_task(task_id: str) -> list[dict]:
    """Return all notes belonging to a task, sorted by creation date."""
    return sorted(
        [n for n in notes.values() if n["taskId"] == task_id],
        key=lambda n: n["createdAt"],
    )


def enrich_task(task: dict) -> dict:
    """Attach notesCount and latestNote preview to a task dict."""
    task_notes = get_notes_for_task(task["id"])
    return {
        **task,
        "notesCount": len(task_notes),
        "latestNote": task_notes[-1]["content"] if task_notes else None,
    }


def make_error(message: str, status: int = 400):
    return jsonify({"error": message}), status


# ---------------------------------------------------------------------------
# Task Routes
# ---------------------------------------------------------------------------

@app.route("/tasks", methods=["GET"])
def list_tasks():
    """Return every task with note counts and latest note preview.
    Optional query params: ?status=pending|in-progress|completed
    Auto-status logic:
      - If finishBy is past and status != completed → status becomes pending
      - If startTime is past and status == pending → status becomes in-progress
    """
    now = datetime.now(timezone.utc)
    for t in tasks.values():
        if t["status"] == "completed":
            continue
        finish_by = t.get("finishBy")
        start_time = t.get("startTime")
        if finish_by:
            try:
                fb = datetime.fromisoformat(finish_by).replace(tzinfo=timezone.utc) if "+" not in finish_by and "Z" not in finish_by else datetime.fromisoformat(finish_by.replace("Z", "+00:00"))
                if fb < now and t["status"] != "completed":
                    t["status"] = "pending"
                    t["overdue"] = True
            except (ValueError, TypeError):
                pass
        if start_time and t["status"] == "pending":
            try:
                st = datetime.fromisoformat(start_time).replace(tzinfo=timezone.utc) if "+" not in start_time and "Z" not in start_time else datetime.fromisoformat(start_time.replace("Z", "+00:00"))
                if st <= now:
                    t["status"] = "in-progress"
            except (ValueError, TypeError):
                pass

    status_filter = request.args.get("status")
    result = [enrich_task(t) for t in tasks.values()]

    if status_filter and status_filter in ("pending", "in-progress", "completed"):
        result = [t for t in result if t["status"] == status_filter]

    result.sort(key=lambda t: t["createdAt"], reverse=True)
    return jsonify(result)


@app.route("/tasks/<task_id>", methods=["GET"])
def get_task(task_id: str):
    """Return a single task by ID."""
    task = tasks.get(task_id)
    if not task:
        return make_error("Task not found", 404)
    return jsonify(enrich_task(task))


@app.route("/tasks", methods=["POST"])
def create_task():
    """Create a new task. Requires title; description is optional."""
    data = request.get_json(silent=True) or {}

    title = (data.get("title") or "").strip()
    if not title:
        return make_error("Title is required")

    description = (data.get("description") or "").strip()
    status = data.get("status", "pending")
    if status not in ("pending", "in-progress", "completed"):
        return make_error("Status must be pending, in-progress, or completed")

    task_id = str(uuid.uuid4())
    task = {
        "id": task_id,
        "title": title,
        "description": description,
        "status": status,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "startTime": data.get("startTime"),
        "finishBy": data.get("finishBy"),
        "dueDate": data.get("dueDate"),
        "reminderEnabled": bool(data.get("reminderEnabled", False)),
    }
    tasks[task_id] = task
    return jsonify(enrich_task(task)), 201


@app.route("/tasks/<task_id>", methods=["PATCH"])
def update_task(task_id: str):
    """Update a task's status (and optionally title/description)."""
    task = tasks.get(task_id)
    if not task:
        return make_error("Task not found", 404)

    data = request.get_json(silent=True) or {}

    if "status" in data:
        if data["status"] not in ("pending", "in-progress", "completed"):
            return make_error("Status must be pending, in-progress, or completed")
        task["status"] = data["status"]

    if "title" in data:
        title = (data["title"] or "").strip()
        if not title:
            return make_error("Title cannot be empty")
        task["title"] = title

    if "description" in data:
        task["description"] = (data["description"] or "").strip()

    if "startTime" in data:
        task["startTime"] = data["startTime"]

    if "finishBy" in data:
        task["finishBy"] = data["finishBy"]

    if "dueDate" in data:
        task["dueDate"] = data["dueDate"]

    if "reminderEnabled" in data:
        task["reminderEnabled"] = bool(data["reminderEnabled"])

    # Clear overdue flag if manually completed
    if task["status"] == "completed":
        task.pop("overdue", None)

    return jsonify(enrich_task(task))


# ---------------------------------------------------------------------------
# Notes Routes
# ---------------------------------------------------------------------------

@app.route("/tasks/<task_id>/notes", methods=["GET"])
def list_notes(task_id: str):
    """Return all notes for a task in chronological order."""
    if task_id not in tasks:
        return make_error("Task not found", 404)
    return jsonify(get_notes_for_task(task_id))


@app.route("/tasks/<task_id>/notes", methods=["POST"])
def add_note(task_id: str):
    """Add a progress note to a task. Optionally mark the task as complete."""
    task = tasks.get(task_id)
    if not task:
        return make_error("Task not found", 404)

    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return make_error("Note content is required")

    if data.get("markComplete"):
        task["status"] = "completed"

    note_id = str(uuid.uuid4())
    note = {
        "id": note_id,
        "taskId": task_id,
        "content": content,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    notes[note_id] = note
    return jsonify(note), 201


# ---------------------------------------------------------------------------
# AI Routes (Groq)
# ---------------------------------------------------------------------------

@app.route("/tasks/<task_id>/ai-recommend", methods=["POST"])
def ai_recommend(task_id: str):
    """Get AI-powered recommendations for a task."""
    task = tasks.get(task_id)
    if not task:
        return make_error("Task not found", 404)

    try:
        task_notes = get_notes_for_task(task_id)
        recommendation = get_task_recommendations(task, task_notes)
        return jsonify({"recommendation": recommendation})
    except Exception as e:
        return make_error(f"AI service error: {str(e)}", 500)


@app.route("/chat", methods=["POST"])
def chat():
    """AI chat endpoint with task context."""
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    if not message:
        return make_error("Message is required")

    try:
        tasks_context = [enrich_task(t) for t in tasks.values()]
        history = data.get("history", chat_history)

        reply = chat_with_context(message, tasks_context, history)

        # Store in session history
        chat_history.append({"role": "user", "content": message})
        chat_history.append({"role": "assistant", "content": reply})

        return jsonify({"reply": reply})
    except Exception as e:
        return make_error(f"AI service error: {str(e)}", 500)


# ---------------------------------------------------------------------------
# Profile Routes
# ---------------------------------------------------------------------------

@app.route("/profile", methods=["GET"])
def get_profile():
    """Return user profile with task statistics."""
    all_tasks = list(tasks.values())
    stats = {
        "total": len(all_tasks),
        "pending": sum(1 for t in all_tasks if t["status"] == "pending"),
        "inProgress": sum(1 for t in all_tasks if t["status"] == "in-progress"),
        "completed": sum(1 for t in all_tasks if t["status"] == "completed"),
    }
    return jsonify({**profile, "stats": stats})


@app.route("/profile", methods=["POST"])
def update_profile():
    """Update user profile (name, avatar emoji)."""
    data = request.get_json(silent=True) or {}

    if "name" in data:
        profile["name"] = (data["name"] or "User").strip()
    if "avatar" in data:
        profile["avatar"] = data["avatar"] or "😊"

    return jsonify(profile)


# ---------------------------------------------------------------------------
# App entry-point
# ---------------------------------------------------------------------------

seed_data()

if __name__ == "__main__":
    print("\n  Task Tracker API running at http://localhost:5000\n")
    app.run(debug=False, port=5000, host="0.0.0.0")
