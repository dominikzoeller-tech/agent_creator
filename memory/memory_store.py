import json
import re
from pathlib import Path
from typing import List, Dict
from config import PROJECT_ROOT

MEMORY_FILE = Path(PROJECT_ROOT) / "memory" / "memory_store.json"


def _ensure_memory_file() -> None:
    """Stellt sicher, dass die Memory-Datei vorhanden ist."""
    MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not MEMORY_FILE.exists():
        MEMORY_FILE.write_text("[]", encoding="utf-8")


def _load_memory_data() -> List[Dict[str, str]]:
    """Lädt alle Einträge aus dem Memory-Speicher."""
    _ensure_memory_file()
    try:
        raw = MEMORY_FILE.read_text(encoding="utf-8")
        data = json.loads(raw)
        if isinstance(data, list):
            return data
    except (json.JSONDecodeError, OSError):
        pass
    return []


def _save_memory_data(data: List[Dict[str, str]]) -> None:
    """Speichert den Memory-Datensatz als JSON-Datei."""
    MEMORY_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def save_memory(
    task: str,
    code: str,
    feedback: str,
    score: Optional[float] = None,
    success: Optional[bool] = None,
    variant: Optional[str] = None,
    filename: Optional[str] = None,
    best_agent: bool = False,
) -> None:
    """Speichert einen Task mit generiertem Code, Score und Erfolg im Memory."""
    memory_data = _load_memory_data()
    memory_data.append(
        {
            "task": task,
            "code": code,
            "feedback": feedback,
            "score": score,
            "success": success,
            "variant": variant,
            "filename": filename,
            "best_agent": best_agent,
        }
    )
    _save_memory_data(memory_data)


def load_similar_tasks(task: str, limit: int = 3) -> List[Dict[str, str]]:
    """Lädt ähnliche vergangene Tasks aus dem Memory basierend auf Schlüsselwörtern."""
    memory_data = _load_memory_data()
    if not task or not memory_data:
        return []

    query_words = {
        token.lower()
        for token in re.findall(r"[A-Za-z0-9]+", task)
        if len(token) > 3
    }
    if not query_words:
        return []

    scored_entries = []
    for entry in memory_data:
        entry_words = {
            token.lower()
            for token in re.findall(r"[A-Za-z0-9]+", entry.get("task", ""))
            if len(token) > 3
        }
        score = len(query_words & entry_words)
        if score > 0:
            scored_entries.append((score, entry))

    scored_entries.sort(key=lambda item: item[0], reverse=True)
    return [entry for _, entry in scored_entries[:limit]]


def load_top_agents(limit: int = 3) -> List[Dict[str, str]]:
    """Lädt die besten erfolgreichen Agenten aus dem Memory."""
    memory_data = _load_memory_data()
    successful_entries = [
        entry for entry in memory_data
        if entry.get("success") is True and isinstance(entry.get("score"), (int, float))
    ]
    successful_entries.sort(key=lambda item: float(item.get("score", 0)), reverse=True)
    return successful_entries[:limit]
