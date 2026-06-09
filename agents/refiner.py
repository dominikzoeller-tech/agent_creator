"""
Refiner Agent für das AI Agent Builder System.

Der Refiner Agent verbessert generierten Code basierend auf
dem Feedback des Critic Agents.
"""

import re
from core.state import BuilderState, RefineOutput, CodeOutput, AgentStatus
from core.llm import get_llm_client, get_system_prompt


class RefinerAgent:
    """
    Agent, der Code basierend auf Critic-Feedback verbessert.
    
    Der Refiner nimmt Kritik und Verbesserungsvorschläge und erstellt
    eine verbesserte Version des Codes.
    """
    
    def __init__(self):
        """Initialisiert den Refiner Agent."""
        self.llm = get_llm_client()
        self.system_prompt = get_system_prompt("refiner")
    
    def refine_code(self, state: BuilderState, execution_feedback: str = "") -> BuilderState:
        """
        Verbessert den Code basierend auf Critic-Feedback oder Laufzeit-Fehlern.
        
        Args:
            state: Der aktuelle BuilderState
            execution_feedback: Optionaler Laufzeit-Output oder Fehlermeldungen
        
        Returns:
            Aktualisierter BuilderState mit verbessertem Code
        """
        print("\n🔧 REFINER AGENT - Verbessere Code basierend auf Feedback...")
        state.update_status(AgentStatus.REFINING)
        
        # Überprüfe, ob Code und Review vorhanden sind
        if not state.generated_code:
            state.add_error("Kein Code vorhanden.")
            return state
        
        if not state.current_review:
            state.add_error("Kein Review vorhanden.")
            return state
        
        # Erstelle Prompt für Verbesserung
        prompt = self._create_refinement_prompt(
            state.generated_code.code,
            state.current_review,
            execution_feedback,
        )
        
        try:
            # Rufe LLM auf, um Code zu verbessern
            response = self.llm.generate_text(
                prompt=prompt,
                system_prompt=self.system_prompt,
                parse_json=False,
            )
            
            # Extrahiere verbesserten Code
            refined_code = self._extract_code(response)
            
            # Berechne Verbesserungsscore (heuristisch)
            improvement_score = self._calculate_improvement_score(
                state.current_review
            )
            
            # Erstelle RefineOutput
            refinement = RefineOutput(
                refined_code=refined_code,
                changes_made=self._extract_changes(response),
                improvement_score=improvement_score,
            )
            
            # Aktualisiere State
            state.refinements.append(refinement)
            state.total_improvements += 1
            
            # Aktualisiere generated_code mit verbessertem Code
            state.generated_code = CodeOutput(
                code=refined_code,
                language="python",
                filename=state.generated_code.filename,
                explanations={"refinement_iteration": state.total_improvements},
            )
            
            state.code_version += 1
            
            print(f"✅ Code verbessert (Version {state.code_version})")
            print(f"   Verbesserungsscore: {improvement_score:.1%}")
            print(f"   Insgesamt {state.total_improvements} Verbesserungen durchgeführt")
            
            # Gebe Refinement-Zusammenfassung aus
            self._print_refinement_summary(refinement)
            
        except Exception as e:
            error_msg = f"Fehler bei der Code-Verbesserung: {str(e)}"
            state.add_error(error_msg)
            return state
        
        return state
    
    def _create_refinement_prompt(self, code: str, review, execution_feedback: str = "") -> str:
        """
        Erstellt den Prompt für die Code-Verbesserung.
        
        Args:
            code: Der aktuelle Code
            review: Das ReviewOutput-Objekt mit Feedback
            execution_feedback: Optionaler Laufzeit-Output oder Fehlermeldungen
        
        Returns:
            Formatierter Prompt
        """
        # Formatiere Probleme und Verbesserungsvorschläge
        issues_text = "\n".join(f"- {issue}" for issue in review.issues)
        improvements_text = "\n".join(f"- {imp}" for imp in review.improvements)
        fixes_text = "\n".join(f"- {fix}" for fix in getattr(review, 'fix_suggestions', []))
        root_causes_text = "\n".join(f"- {root}" for root in getattr(review, 'root_causes', []))
        security_text = "\n".join(f"- {sec}" for sec in review.security_issues)
        execution_text = execution_feedback or "- Keine zusätzlichen Laufzeitinformationen verfügbar."
        
        return f"""
Du musst den folgenden Python-Code basierend auf dem Feedback verbessern:

AKTUELLER CODE:
```python
{code}
```

FEEDBACK VOM CODE REVIEWER:

ERKANNTE PROBLEME:
{issues_text or "- Keine größeren Probleme"}

URSACHEN:
{root_causes_text or "- Keine Ursachenanalyse verfügbar"}

KONKRETE FIX-VORSCHLÄGE:
{fixes_text or "- Keine konkreten Fix-Vorschläge verfügbar"}

SICHERHEITSBEDENKEN:
{security_text or "- Keine Sicherheitsbedenken"}

Laufzeit-Debug-Informationen:
{execution_text}

REVIEW FEEDBACK:
{review.overall_feedback or "Code sollte verbessert werden"}

DEINE AUFGABE:
1. Behebe alle genannten Probleme
2. Implementiere die Verbesserungsvorschläge
3. Adressiere Sicherheitsbedenken
4. Nutze die konkreten Fix-Vorschläge als Leitfaden
5. Behebe Laufzeitfehler und passe den Code an
6. Behalte die ursprüngliche Funktionalität bei
7. Verbessere Lesbarkeit, Wartbarkeit und Performance

Gib den verbesserten Code in einem Python-Codeblock aus:

```python
[REFINED CODE HERE]
```

Nach dem Code, liste die wichtigsten Änderungen auf.
"""
    
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
            if code.startswith("python"):
                code = code[6:].lstrip()
            return code
        
        return response
    
    def _extract_changes(self, response: str) -> list:
        """
        Extrahiert die durchgeführten Änderungen aus der Antwort.
        
        Args:
            response: Die LLM-Antwort
        
        Returns:
            Liste der Änderungen
        """
        changes = []
        
        # Versuche, Änderungen nach "Änderungen" oder "Changes" zu finden
        patterns = [
            r"(?:Änderungen|Changes|Improvements).*?:?\n((?:- .*\n?)+)",
            r"(?:wichtigsten Änderungen|main changes).*?:?\n((?:- .*\n?)+)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, response, re.IGNORECASE | re.DOTALL)
            if match:
                changes_text = match.group(1)
                changes = [
                    line.strip("- ").strip()
                    for line in changes_text.split("\n")
                    if line.strip().startswith("-")
                ]
                break
        
        return changes if changes else ["Code wurde optimiert und verbessert"]
    
    def _calculate_improvement_score(self, review) -> float:
        """
        Berechnet einen heuristischen Verbesserungsscore.
        
        Args:
            review: Das ReviewOutput-Objekt
        
        Returns:
            Score zwischen 0 und 1
        """
        # Wenn Review-Score bereits hoch ist, wird weniger verbessert
        # Wenn Review-Score niedrig ist, kann mehr verbessert werden
        
        # Basis-Score basierend auf Anzahl von Problemen
        problem_count = len(review.issues) + len(review.security_issues)
        suggestion_count = len(review.improvements)
        
        # Je mehr Verbesserungsvorschläge, desto höher das Potenzial
        potential_improvement = min(suggestion_count * 0.15, 0.6)
        
        # Anpassung basierend auf aktuellem Score
        if review.code_quality_score > 7:
            potential_improvement *= 0.5
        
        return min(potential_improvement, 0.8)
    
    def _print_refinement_summary(self, refinement: RefineOutput) -> None:
        """
        Gibt eine Zusammenfassung der Verbesserungen aus.
        
        Args:
            refinement: Das RefineOutput-Objekt
        """
        print("\n" + "=" * 70)
        print("✨ VERBESSERUNGSZUSAMMENFASSUNG")
        print("=" * 70)
        
        print(f"\nVerbesserungsscore: {refinement.improvement_score:.1%}")
        print(f"Code-Größe: {len(refinement.refined_code)} Zeichen")
        print(f"Zeilen Code: {len(refinement.refined_code.splitlines())}")
        
        if refinement.changes_made:
            print("\n🔄 Durchgeführte Änderungen:")
            for i, change in enumerate(refinement.changes_made[:5], 1):
                print(f"   {i}. {change}")
            
            if len(refinement.changes_made) > 5:
                print(f"   ... und {len(refinement.changes_made) - 5} weitere")
        
        print("\n" + "=" * 70)
