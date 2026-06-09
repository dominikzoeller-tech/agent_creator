"""
Zentrale Konfigurationsdatei für das AI Agent Builder System.

Diese Datei verwaltet alle Konfigurationsparameter, einschließlich
LLM-Einstellungen, API-Keys und Pfade.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    load_dotenv = None

# ============================================================================
# OpenAI Konfiguration
# ============================================================================

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))

# ============================================================================
# Agent-Verhalten Konfiguration
# ============================================================================

# Maximale Anzahl von Iterationen für Review- und Verbesserungsloops
MAX_ITERATIONS = int(os.getenv("MAX_ITERATIONS", "3"))
MAX_REFINER_ITERATIONS = MAX_ITERATIONS

# Maximale Anzahl von Debug-Retries für die Codeausführung
EXECUTION_MAX_RETRIES = int(os.getenv("EXECUTION_MAX_RETRIES", "2"))
EXECUTION_TIMEOUT = int(os.getenv("EXECUTION_TIMEOUT", "15"))

# Minimale Kritik-Score für Zufriedenheit (0-10)
QUALITY_THRESHOLD = float(os.getenv("QUALITY_THRESHOLD", "7.0"))

# ============================================================================
# Pfad-Konfiguration
# ============================================================================

# Basis-Pfad des Projekts
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

# Ausgabepfad für generierte Agenten
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output", "generated_agents")
BEST_AGENT_DIR = os.path.join(PROJECT_ROOT, "output", "best_agent")

# Stelle sicher, dass die Ausgabeverzeichnisse existieren
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(BEST_AGENT_DIR, exist_ok=True)

# ============================================================================
# Logging Konfiguration
# ============================================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.path.join(PROJECT_ROOT, "agent_builder.log")

# ============================================================================
# Validierung
# ============================================================================

# Hinweis: Die OpenAI API-Konfiguration wird bei Bedarf im LLM-Wrapper geprüft.
# Wenn OPENAI_API_KEY fehlt oder nur der Platzhalter verwendet wird,
# wird ein klarer Fehler bei der tatsächlichen LLM-Nutzung ausgelöst.
