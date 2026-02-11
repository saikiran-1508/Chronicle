"""
Groq API integration for AI-powered task analysis and chat.
"""

import os
import json
import urllib.request
import urllib.error

# ── Configuration ────────────────────────────────────────────────────────────
# Set your Groq API key here or via environment variable
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "YOUR_GROQ_API_KEY_HERE")
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


def _call_groq(messages, max_tokens=1024):
    """Send a chat completion request to the Groq API."""
    if GROQ_API_KEY == "YOUR_GROQ_API_KEY_HERE":
        raise ValueError("Groq API key not configured. Set GROQ_API_KEY in groq_service.py or as an environment variable.")

    payload = json.dumps({
        "model": GROQ_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }).encode("utf-8")

    req = urllib.request.Request(
        GROQ_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        raise RuntimeError(f"Groq API error ({e.code}): {error_body}")
    except Exception as e:
        raise RuntimeError(f"Groq API request failed: {str(e)}")


def get_task_recommendations(task, notes):
    """
    Analyze a task and its notes, return AI recommendations.
    Returns a structured string with suggestions.
    """
    notes_text = "\n".join(
        [f"  - [{n['createdAt']}] {n['content']}" for n in notes]
    ) or "  (no notes yet)"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful project management assistant. Analyze the task "
                "and its progress notes, then provide actionable recommendations. "
                "Be concise and practical. Format your response with these sections:\n"
                "📋 Summary | ⚡ Next Steps | ⏱️ Time Estimate | ⚠️ Potential Blockers | 🎯 Priority"
            ),
        },
        {
            "role": "user",
            "content": (
                f"Task: {task['title']}\n"
                f"Description: {task.get('description', 'N/A')}\n"
                f"Status: {task['status']}\n"
                f"Created: {task['createdAt']}\n"
                f"Progress Notes:\n{notes_text}"
            ),
        },
    ]

    return _call_groq(messages)


def chat_with_context(user_message, tasks_context, chat_history=None):
    """
    AI chat that understands the user's tasks.
    tasks_context: list of task dicts
    chat_history: list of prior {role, content} messages
    """
    # Build task summary for context
    tasks_summary = "\n".join(
        [
            f"- [{t['status'].upper()}] {t['title']} ({t.get('notesCount', 0)} notes)"
            for t in tasks_context
        ]
    ) or "(no tasks)"

    messages = [
        {
            "role": "system",
            "content": (
                "You are a smart task management assistant. You have access to the user's "
                "current tasks listed below. Help them with task planning, prioritization, "
                "progress tracking, and general productivity advice. Be friendly and concise.\n\n"
                f"USER'S TASKS:\n{tasks_summary}"
            ),
        },
    ]

    # Add chat history if available
    if chat_history:
        messages.extend(chat_history[-10:])  # Keep last 10 messages for context

    messages.append({"role": "user", "content": user_message})

    return _call_groq(messages, max_tokens=512)
