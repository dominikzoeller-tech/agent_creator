"""
Planner Agent für das AI Agent Builder System.

Der Planner Agent nimmt die Benutzeranfrage an und erstellt einen
detaillierten Plan für die Agenten-Generierung.
"""

import json
from typing import Optional, List, Dict, Any
from core.state import BuilderState, PlanOutput, PlanStep, AgentStatus
from core.llm import get_llm_client, get_system_prompt
from tools.api_finder import find_apis_for_task


class PlannerAgent:
    """
    Agent, der Pläne für neue Agenten erstellt.

    Basierend auf einer Benutzeranfrage (z.B. "Baue einen Trading Bot")
    erstellt dieser Agent einen detaillierten Plan mit Schritten,
    benötigten APIs, potenziellen Herausforderungen und einer Modulstruktur.
    """

    def __init__(self):
        """Initialisiert den Planner Agent."""
        self.llm = get_llm_client()
        self.system_prompt = get_system_prompt("planner")
        self.last_user_request = ""

    def plan(self, state: BuilderState, variant_description: str = "") -> BuilderState:
        """
        Erstellt einen Plan basierend auf der Benutzeranfrage.

        Args:
            state: Der aktuelle BuilderState
            variant_description: Optionaler Fokus der Variante

        Returns:
            Aktualisierter BuilderState mit Plan
        """
        self.last_user_request = state.user_request

        print("\n🔍 PLANNER AGENT - Analysiere Anforderung und erstelle Plan...")
        state.update_status(AgentStatus.PLANNING)

        prompt = self._create_planning_prompt(state.user_request, variant_description)

        try:
            response = self.llm.generate_text(
                prompt=prompt,
                system_prompt=self.system_prompt,
                parse_json=True,
            )

            if isinstance(response, dict):
                plan = self._parse_plan_response(response)
            else:
                plan = self._parse_plan_response(json.loads(response))

            # Falls der Planner keine APIs geliefert hat, ergänze sie über das API-Finder-Tool.
            if not plan.required_apis:
                plan.required_apis = find_apis_for_task(state.user_request)

            state.plan = plan
            print(f"✅ Plan erstellt: {plan.agent_name}")
            print(f"   Komplexität: {plan.estimated_complexity}")
            print(f"   Schritte: {len(plan.plan_steps)}")
            print(f"   APIs: {len(plan.required_apis)} gefunden")
            print(f"   Herausforderungen: {len(plan.potential_challenges)}")

            self._print_plan(plan)

        except Exception as e:
            error_msg = f"Fehler beim Erstellen des Plans: {str(e)}"
            state.add_error(error_msg)
            return state

        return state

    def _create_planning_prompt(self, user_request: str, variant_description: str = "") -> str:
        """
        Erstellt den Prompt für die Plan-Generierung.

        Args:
            user_request: Die Anfrage des Benutzers
            variant_description: Optionaler Fokus einer spezifischen Variante

        Returns:
            Formatierter Prompt
        """
        variant_text = f"\nVARIANTE: {variant_description}\n" if variant_description else ""
        return f"""
Analysiere die folgende Anfrage und erstelle einen detaillierten Plan für die Agenten-Generierung:{variant_text}

ANFRAGE: {user_request}

Erstelle einen strukturierten Plan mit den folgenden Informationen (als JSON):

{{
    "agent_name": "Name des Agenten (keine Leerzeichen, z.B. trading_bot)",
    "agent_description": "Kurze 1-2 Satz Beschreibung des Agenten",
    "estimated_complexity": "low|medium|high",
    "required_apis": [
        {{
            "name": "API Name",
            "description": "Kurze Beschreibung warum diese API geeignet ist",
            "reason": "Warum sie für diesen Agenten hilfreich ist"
        }}
    ],
    "potential_challenges": [
        "Liste möglicher Herausforderungen"
    ],
    "module_structure": "Kurze Beschreibung der empfohlenen Modulstruktur oder Dateien",
    "plan_steps": [
        {{
            "step_number": 1,
            "title": "Schritt-Titel",
            "description": "Detaillierte Beschreibung des Schritts",
            "implementation_notes": "Konkrete Implementierungsanweisungen"
        }}
    ]
}}

Erstelle 4-6 detaillierte Schritte. Jeder Schritt sollte spezifisch und implementierbar sein.
"""

    def _parse_plan_response(self, response_dict: Dict[str, Any]) -> PlanOutput:
        """
        Parst die LLM-Antwort in ein PlanOutput-Objekt.

        Args:
            response_dict: Dictionary mit der Plan-Information

        Returns:
            PlanOutput Objekt
        """
        plan_steps = []
        for i, step_dict in enumerate(response_dict.get("plan_steps", []) or []):
            plan_steps.append(
                PlanStep(
                    step_number=step_dict.get("step_number", i + 1),
                    title=step_dict.get("title", ""),
                    description=step_dict.get("description", ""),
                    implementation_notes=step_dict.get("implementation_notes", ""),
                )
            )

        required_apis = []
        for item in response_dict.get("required_apis", []) or []:
            if isinstance(item, dict):
                required_apis.append(
                    {
                        "name": str(item.get("name", "")).strip(),
                        "description": str(item.get("description", "")).strip(),
                    }
                )

        potential_challenges = response_dict.get("potential_challenges", []) or []
        if isinstance(potential_challenges, str):
            potential_challenges = [line.strip() for line in potential_challenges.splitlines() if line.strip()]

        module_structure = response_dict.get("module_structure", "") or ""

        return PlanOutput(
            user_request=self.last_user_request or "",
            agent_name=response_dict.get("agent_name", "unknown_agent"),
            agent_description=response_dict.get("agent_description", ""),
            plan_steps=plan_steps,
            estimated_complexity=response_dict.get("estimated_complexity", "medium"),
            required_apis=required_apis,
            potential_challenges=[str(item).strip() for item in potential_challenges],
            module_structure=str(module_structure).strip(),
        )

    def _print_plan(self, plan: PlanOutput) -> None:
        """
        Gibt den Plan in einer schönen Formatierung aus.

        Args:
            plan: Das PlanOutput-Objekt
        """
        print("\n" + "=" * 70)
        print("📋 PLAN DETAILS")
        print("=" * 70)
        print(f"Agent: {plan.agent_name}")
        print(f"Beschreibung: {plan.agent_description}")
        print(f"Komplexität: {plan.estimated_complexity}")
        print(f"Modulstruktur: {plan.module_structure}")

        if plan.required_apis:
            print("\n🔗 Empfohlene APIs:")
            for api in plan.required_apis:
                print(f"  - {api.get('name')}: {api.get('description')}")

        if plan.potential_challenges:
            print("\n⚠️ Potenzielle Herausforderungen:")
            for challenge in plan.potential_challenges:
                print(f"  - {challenge}")

        print("\nPlan-Schritte:")
        for step in plan.plan_steps:
            print(f"\n  Schritt {step.step_number}: {step.title}")
            print(f"  ├─ {step.description}")
            print(f"  └─ Hinweise: {step.implementation_notes[:60]}...")

        print("\n" + "=" * 70)
