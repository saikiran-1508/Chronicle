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
    "reminderSound": "default",
}
chat_history: list[dict] = []





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


@app.route("/tasks/<task_id>", methods=["DELETE"])
def delete_task(task_id: str):
    """Delete a task and all its associated notes."""
    task = tasks.get(task_id)
    if not task:
        return make_error("Task not found", 404)

    # Remove all notes for this task
    note_ids_to_remove = [nid for nid, n in notes.items() if n["taskId"] == task_id]
    for nid in note_ids_to_remove:
        del notes[nid]

    del tasks[task_id]
    return jsonify({"message": "Task deleted"}), 200


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
    if "reminderSound" in data:
        profile["reminderSound"] = data["reminderSound"] or "default"

    return jsonify(profile)


# ---------------------------------------------------------------------------
# App entry-point
# ---------------------------------------------------------------------------

# No seed data — app starts with an empty task list

if __name__ == "__main__":
    print("\n  Task Tracker API running at http://localhost:5000\n")
    app.run(debug=False, port=5000, host="0.0.0.0")
