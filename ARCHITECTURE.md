"""
ARCHITEKTUR-DOKUMENTATION - AI Agent Builder System

Dieses Dokument erklärt die technische Architektur des Systems.
"""

# ═══════════════════════════════════════════════════════════════════════════
# SYSTEMARCHITEKTUR
# ═══════════════════════════════════════════════════════════════════════════

"""
┌─────────────────────────────────────────────────────────────────────────┐
│                    AI AGENT BUILDER SYSTEM ARCHITEKTUR                  │
└─────────────────────────────────────────────────────────────────────────┘

1. EINSTIEGSPUNKT (main.py)
   ├─ AgentBuilderSystem
   │  ├─ Orchestrierung der Sub-Agenten
   │  ├─ State Management
   │  └─ Iterativer Loop-Kontroll

2. CORE LAYER (core/)
   ├─ llm.py
   │  ├─ LLMClient: Wrapper für OpenAI
   │  ├─ get_llm_client(): Singleton Pattern
   │  └─ System Prompts für jeden Agent-Typ
   │
   └─ state.py
      ├─ BuilderState: Zentrale Zustandsverwaltung
      ├─ PlanOutput, CodeOutput, ReviewOutput, RefineOutput
      └─ AgentStatus Enum

3. AGENT LAYER (agents/)
   ├─ planner.py (PlannerAgent)
   │  ├─ Input: user_request
   │  └─ Output: PlanOutput (plan_steps)
   │
   ├─ coder.py (CoderAgent)
   │  ├─ Input: PlanOutput
   │  └─ Output: CodeOutput (Python-Code)
   │
   ├─ critic.py (CriticAgent)
   │  ├─ Input: CodeOutput
   │  ├─ Output: ReviewOutput (quality_score, issues, improvements)
   │  └─ Bewertet auf Qualität, Sicherheit, Performance
   │
   └─ refiner.py (RefinerAgent)
      ├─ Input: CodeOutput + ReviewOutput
      ├─ Output: RefineOutput (refined_code)
      └─ Verbessert basierend auf Feedback

4. KONFIGURATION & UTILITIES
   ├─ config.py
   │  ├─ OpenAI API Settings
   │  ├─ Agent-Verhalten Parameter
   │  └─ Pfade & Logging
   │
   └─ requirements.txt
      ├─ langchain
      ├─ openai
      └─ python-dotenv

5. OUTPUT
   └─ output/generated_agents/
      └─ {agent_name}.py (Generierte Agenten)

═══════════════════════════════════════════════════════════════════════════
WORKFLOW / DATENFLUSSS
═══════════════════════════════════════════════════════════════════════════

USER INPUT
    ↓
[PLANNER] Erstellt detaillierten Plan
    ↓ (PlanOutput)
[CODER] Generiert Python-Code
    ↓ (CodeOutput)
    ├──→ [CRITIC] Bewertet Code
    │        ↓ (ReviewOutput)
    │        Quality Score < 7.0? → JA →┐
    │                                   ↓
    │                           [REFINER] Verbessert
    │                                   ↓
    │                           ← Zurück zu CRITIC ←
    │        Quality Score >= 7.0? → NEIN → Exit Loop
    ↓
[SAVER] Speichert finalen Code
    ↓
AUSGABE: {agent_name}.py

═══════════════════════════════════════════════════════════════════════════
STATE MANAGEMENT
═══════════════════════════════════════════════════════════════════════════

BuilderState ist eine Dataclass, die den kompletten Zustand verwaltet:

BuilderState
├─ user_request: str
├─ status: AgentStatus (PLANNING, CODING, REVIEWING, REFINING, COMPLETED)
├─ iteration_count: int
├─ plan: Optional[PlanOutput]
├─ generated_code: Optional[CodeOutput]
├─ code_version: int
├─ reviews: List[ReviewOutput]      # Alle Reviews
├─ current_review: Optional[ReviewOutput]
├─ refinements: List[RefineOutput]  # Alle Refinements
├─ current_refinement: Optional[RefineOutput]
├─ quality_history: List[float]     # Qualitätsverlauf
├─ total_improvements: int
├─ final_code: Optional[str]
├─ final_filename: Optional[str]
├─ final_quality_score: Optional[float]
└─ errors: List[str]

═══════════════════════════════════════════════════════════════════════════
KONFIGURATIONSPARAMETER
═══════════════════════════════════════════════════════════════════════════

OpenAI Settings:
  - OPENAI_MODEL: "gpt-4" (Best für komplexe Aufgaben)
  - OPENAI_TEMPERATURE: 0.7 (Balance zwischen Kreativität und Konsistenz)
  - OPENAI_MAX_TOKENS: 2000 (Maximale Antwortlänge)

Agent-Verhalten:
  - MAX_REFINER_ITERATIONS: 3 (Maximale Verbesserungsschleifen)
  - QUALITY_THRESHOLD: 7.0 (Minimale akzeptable Qualität 0-10)

═══════════════════════════════════════════════════════════════════════════
DESIGN PATTERNS
═══════════════════════════════════════════════════════════════════════════

1. SINGLETON PATTERN (LLM Client)
   get_llm_client() stellt sicher, dass nur eine LLMClient-Instanz existiert
   Vorteil: Effiziente Ressourcennutzung

2. DATACLASS PATTERN (State Management)
   Verwendet @dataclass für typsichere Zustandsverwaltung
   Vorteil: Type Safety, Lesbarkeit

3. ORCHESTRATOR PATTERN (AgentBuilderSystem)
   Zentrale Klasse koordiniert alle Sub-Agenten
   Vorteil: Einfache Ablaufkontrolle, Error Handling

4. TEMPLATE METHOD PATTERN (Agent-Klassen)
   Jeder Agent folgt ähnlichem Pattern: plan(), generate_code(), review_code()
   Vorteil: Konsistenz, Erweiterbarkeit

5. FEEDBACK LOOP PATTERN
   Iterative Verbesserung basierend auf Critic-Feedback
   Vorteil: Kontinuierliche Qualitätsverbesserung

═══════════════════════════════════════════════════════════════════════════
ERROR HANDLING
═══════════════════════════════════════════════════════════════════════════

1. Try-Except in jedem Agent
   Fehler werden abgefangen und im State gespeichert

2. State.add_error() Methode
   Zentrale Fehlerbehandlung

3. Validierung vor jedem Schritt
   Überprüfe ob Input vorhanden ist

4. Graceful Degradation
   System läuft weiter auch wenn ein Schritt fehlschlägt

═══════════════════════════════════════════════════════════════════════════
ERWEITERBARKEIT
═══════════════════════════════════════════════════════════════════════════

Das System ist leicht erweiterbar:

1. Neue Agenten hinzufügen:
   - Neue Datei unter agents/
   - Folge dem AgentInterface Pattern
   - Integriere in AgentBuilderSystem.run()

2. Neue LLM-Modelle:
   - config.py OPENAI_MODEL ändern
   - LLMClient unterstützt alle OpenAI-Modelle

3. Neue Output-Format:
   - Änder _save_final_code() in main.py
   - Unterstütze z.B. JSON, YAML, etc.

4. Custom System Prompts:
   - Bearbeite SYSTEM_PROMPTS in core/llm.py

═══════════════════════════════════════════════════════════════════════════
PERFORMANCE CONSIDERATIONS
═══════════════════════════════════════════════════════════════════════════

1. LLM API Calls:
   - Coder: 1 Aufruf
   - Critic: 1-3 Aufrufe (je nach Iterationen)
   - Refiner: 0-3 Aufrufe
   Total: ~5 API-Calls durchschnittlich

2. Token Nutzung:
   - Input: ~1000-2000 Tokens
   - Output: ~1000-2000 Tokens
   - Durchschnitt: ~4000 Tokens pro Generierung

3. Laufzeit:
   - Durchschnittlich: 30-60 Sekunden
   - Abhängig von OpenAI API Latenz

═══════════════════════════════════════════════════════════════════════════
"""

# QUICK START CODE
"""
from main import AgentBuilderSystem

# Erstelle System
builder = AgentBuilderSystem()

# Starte Generierung
state = builder.run("Baue einen Trading Bot für Bitcoin")

# Zugriff auf Ergebnisse
print(state.final_filename)
print(state.final_quality_score)
print(state.final_code)
"""

# ═══════════════════════════════════════════════════════════════════════════
# END OF ARCHITECTURE DOCUMENTATION
# ═══════════════════════════════════════════════════════════════════════════
