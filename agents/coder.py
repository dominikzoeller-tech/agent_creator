"""
Coder Agent für das AI Agent Builder System.

Der Coder Agent generiert basierend auf dem Plan Python-Code
für den neuen Agenten.
"""

import re
from core.state import BuilderState, CodeOutput, AgentStatus
from core.llm import get_llm_client, get_system_prompt
from tools.api_finder import find_apis_for_task
from tools.web_search import simulate_web_search
from memory.memory_store import load_similar_tasks


class CoderAgent:
    """
    Agent, der Python-Code basierend auf einem Plan generiert.
    
    Dieser Agent nimmt den vom Planner erstellten Plan und generiert
    sauberen, gut dokumentierten Python-Code.
    """
    
    def __init__(self):
        """Initialisiert den Coder Agent."""
        self.llm = get_llm_client()
        self.system_prompt = get_system_prompt("coder")
    
    def generate_code(self, state: BuilderState) -> BuilderState:
        """
        Generiert Python-Code basierend auf dem Plan.
        
        Args:
            state: Der aktuelle BuilderState mit Plan
        
        Returns:
            Aktualisierter BuilderState mit generiertem Code
        """
        print("\n💻 CODER AGENT - Generiere Python-Code...")
        state.update_status(AgentStatus.CODING)
        
        # Überprüfe, ob ein Plan existiert
        if not state.plan:
            state.add_error("Kein Plan vorhanden. Bitte erst Planner Agent ausführen.")
            return state
        
        # Erstelle Prompt für Code-Generierung
        self._populate_api_suggestions(state)
        self._populate_web_research(state)
        self._load_memory_context(state)
        prompt = self._create_coding_prompt(
            task=state.user_request,
            plan=state.plan,
            api_recommendations=state.api_recommendations,
            web_research=state.web_research_summary,
            memory_matches=state.memory_matches,
            variant_label=state.variant_label,
            variant_description=state.variant_description,
        )
        
        try:
            # Rufe LLM auf, um Code zu generieren
            response = self.llm.generate_text(
                prompt=prompt,
                system_prompt=self.system_prompt,
                parse_json=False,
            )
            
            # Extrahiere Python-Code aus der Antwort
            code = self._extract_code(response)
            
            # Erstelle CodeOutput
            state.generated_code = CodeOutput(
                code=code,
                language="python",
                filename=f"{state.plan.agent_name}.py",
                explanations=self._extract_explanations(response),
            )
            
            state.code_version += 1
            
            print(f"✅ Code generiert (Version {state.code_version})")
            print(f"   Dateiname: {state.generated_code.filename}")
            print(f"   Zeilen Code: {len(code.splitlines())}")
            
            # Gebe Code-Vorschau aus
            self._print_code_preview(code)
            
        except Exception as e:
            error_msg = f"Fehler bei der Code-Generierung: {str(e)}"
            state.add_error(error_msg)
            return state
        
        return state
    
    def _create_coding_prompt(
        self,
        task: str,
        plan,
        api_recommendations,
        web_research: str,
        memory_matches,
        variant_label: str = "",
        variant_description: str = "",
    ) -> str:
        """
        Erstellt den Prompt für die Code-Generierung.

        Args:
            task: Die ursprüngliche Benutzeranfrage
            plan: Das PlanOutput-Objekt vom Planner
            api_recommendations: Liste der gefundenen APIs
            web_research: Zusammenfassung der simulierten Web-Recherche
            variant_label: Optionaler Label der Variante
            variant_description: Optionale Beschreibung der Variantenstrategie

        Returns:
            Formatierter Prompt
        """
        steps_text = "\n".join([
            f"{step.step_number}. {step.title}: {step.description}\n"
            f"   Implementierungshints: {step.implementation_notes}"
            for step in plan.plan_steps
        ])

        api_text = "Keine empfohlenen APIs verfügbar."
        if api_recommendations:
            api_lines = []
            for api in api_recommendations:
                api_lines.append(
                    f"- {api.get('name')}: {api.get('description')}\n  Beispiel: {api.get('example_usage') or 'kein Beispiel verfügbar.'}"
                )
            api_text = "\n".join(api_lines)

        web_research_text = web_research or "Keine zusätzliche Web-Recherche verfügbar."

        memory_text = "Keine ähnlichen früheren Aufgaben gefunden."
        if memory_matches:
            examples = []
            for idx, memory in enumerate(memory_matches, start=1):
                code_snippet = "\n".join(memory.get("code", "").splitlines()[:8])
                examples.append(
                    f"Task {idx}: {memory.get('task', '')}\nFeedback: {memory.get('feedback', '')}\nCode-Beispiel:\n{code_snippet}\n---"
                )
            memory_text = "\n\n".join(examples)

        return f"""
TASK:
{task}

PLAN:
Agent: {plan.agent_name}
Beschreibung: {plan.agent_description}
Komplexität: {plan.estimated_complexity}

Module Struktur: {plan.module_structure or 'Nicht spezifiziert'}
Potenzielle Herausforderungen: {', '.join(plan.potential_challenges) if plan.potential_challenges else 'Nicht spezifiziert'}

PLAN-SCHRITTE:
{steps_text}

APIS:
{api_text}

ÄHNLICHE VERGANGENE LÖSUNGEN:
{memory_text}

WEB-RESEARCH:
{web_research_text}

VARIANTE:
Label: {variant_label or 'standard'}
Strategie: {variant_description or 'Nutze einen ausgewogenen Ansatz.'}

ANFORDERUNGEN:
1. Schreibe vollständigen, ausführbaren Python-Code.
2. Nutze moderne Python Best Practices und Type Hints.
3. Implementiere die empfohlenen APIs aktiv im Code.
4. Berücksichtige modulare Struktur und Fehlerbehandlung.
5. Füge ausführliche Docstrings und Kommentare hinzu.
6. Der Code sollte sofort lauffähig sein und sich gut erweitern lassen.

Erzeuge den Code in einem Python-Codeblock:

```python
[CODE HERE]
```

Nach dem Code erkläre kurz die Hauptkomponenten und wie die APIs verwendet werden.
"""

    def _populate_api_suggestions(self, state: BuilderState) -> None:
        """Füllt den State mit passenden API-Empfehlungen."""
        if state.api_recommendations:
            return

        api_candidates = []
        if state.plan and state.plan.required_apis:
            api_candidates = [
                {
                    "name": api.get("name", ""),
                    "description": api.get("description", ""),
                    "example_usage": api.get("example_usage", ""),
                }
                for api in state.plan.required_apis
            ]

        if not api_candidates:
            task_description = state.user_request or state.plan.agent_description
            api_candidates = find_apis_for_task(task_description)

        state.api_recommendations = api_candidates

    def _populate_web_research(self, state: BuilderState) -> None:
        """Füllt den State mit einer simulierten Web-Recherche-Zusammenfassung."""
        if state.web_research_summary:
            return

        query = f"Beste Tools, APIs und Bibliotheken für: {state.user_request}"
        state.web_research_summary = simulate_web_search(query, context=state.plan.agent_description)

    def _load_memory_context(self, state: BuilderState) -> None:
        """Lädt ähnliche Aufgaben aus dem Memory und speichert sie im State."""
        if state.memory_matches:
            return

        state.memory_matches = load_similar_tasks(state.user_request)

    def _extract_code(self, response: str) -> str:
        """
        Extrahiert Python-Code aus der LLM-Antwort.
        
        Args:
            response: Die LLM-Antwort
        
        Returns:
            Extrahierter Python-Code
        """
        # Versuche, Code aus ```python ... ``` Blöcken zu extrahieren
        pattern = r"```python\n(.*?)\n```"
        match = re.search(pattern, response, re.DOTALL)
        
        if match:
            return match.group(1)
        
        # Fallback: Versuche einfache ``` ``` Blöcke
        pattern = r"```\n(.*?)\n```"
        match = re.search(pattern, response, re.DOTALL)
        
        if match:
            code = match.group(1)
            # Entferne führende "python" Tag, falls vorhanden
            if code.startswith("python"):
                code = code[6:].lstrip()
            return code
        
        # Fallback: Gib die gesamte Antwort zurück
        return response
    
    def _extract_explanations(self, response: str) -> dict:
        """
        Extrahiert Erklärungen und Hinweise aus der Antwort.
        
        Args:
            response: Die LLM-Antwort
        
        Returns:
            Dictionary mit Erklärungen
        """
        return {
            "full_response": response,
            "extraction_note": "Code wurde aus der LLM-Antwort extrahiert"
        }
    
    def _print_code_preview(self, code: str) -> None:
        """
        Gibt eine Vorschau des generierten Codes aus.
        
        Args:
            code: Der generierte Code
        """
        print("\n" + "=" * 70)
        print("📄 CODE-VORSCHAU (erste 30 Zeilen)")
        print("=" * 70)
        
        lines = code.splitlines()
        preview_lines = lines[:30]
        
        for i, line in enumerate(preview_lines, 1):
            print(f"{i:3d} | {line}")
        
        if len(lines) > 30:
            print(f"...  | ({len(lines) - 30} weitere Zeilen)")
        
        print("=" * 70)
