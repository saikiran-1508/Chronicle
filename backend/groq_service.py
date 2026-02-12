"""
Google Gemini API integration for AI-powered task analysis and chat.
Drop-in replacement for the previous Groq-based service.
"""

import os
import json
import urllib.request
import urllib.error

# ── Configuration ────────────────────────────────────────────────────────────
# Set your Gemini API key here or via environment variable
# Get a free key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAzKRISa_GHXCP8kfm0OyqOEzWY64YcDOY")
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


def _call_gemini(messages, max_tokens=1024):
    """Send a chat completion request to the Gemini API with retry for rate limits."""
    import time

    if GEMINI_API_KEY == "YOUR_GEMINI_API_KEY_HERE":
        raise ValueError(
            "Gemini API key not configured. Set GEMINI_API_KEY in groq_service.py "
            "or as an environment variable. Get a free key at https://aistudio.google.com/app/apikey"
        )

    # Convert OpenAI-style messages to Gemini format
    system_instruction = None
    contents = []

    for msg in messages:
        if msg["role"] == "system":
            system_instruction = msg["content"]
        elif msg["role"] == "user":
            contents.append({"role": "user", "parts": [{"text": msg["content"]}]})
        elif msg["role"] == "assistant":
            contents.append({"role": "model", "parts": [{"text": msg["content"]}]})

    payload = {
        "contents": contents,
        "generationConfig": {
            "maxOutputTokens": max_tokens,
            "temperature": 0.7,
        },
    }

    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    url = f"{GEMINI_URL}?key={GEMINI_API_KEY}"
    data = json.dumps(payload).encode("utf-8")

    max_retries = 3
    for attempt in range(max_retries):
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                candidate = body["candidates"][0]
                content = candidate.get("content", {})
                parts = content.get("parts", [])
                # Filter to text parts only (skip thinking parts)
                text_parts = [p["text"] for p in parts if "text" in p]
                if text_parts:
                    return text_parts[-1]  # Last text part is the actual response
                return "I couldn't generate a response. Please try again."
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8") if e.fp else str(e)
            if e.code == 429 and attempt < max_retries - 1:
                wait = (attempt + 1) * 15  # 15s, 30s
                print(f"Rate limited, retrying in {wait}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(wait)
                continue
            raise RuntimeError(f"Gemini API error ({e.code}): {error_body}")
        except Exception as e:
            raise RuntimeError(f"Gemini API request failed: {str(e)}")


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

    return _call_gemini(messages)


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

    return _call_gemini(messages, max_tokens=512)
