"""
Critic Agent für das AI Agent Builder System.

Der Critic Agent bewertet generierten Code und gibt konstruktives Feedback.
"""

import json
import re
from typing import Dict, List
from core.state import BuilderState, ReviewOutput, AgentStatus
from core.llm import get_llm_client, get_system_prompt


class CriticAgent:
    """
    Agent, der generierten Code kritisch analysiert und bewertet.
    
    Der Critic untersucht den Code auf Qualität, Sicherheit, Performance,
    Wartbarkeit und gibt detailliertes Feedback zurück.
    """
    
    def __init__(self):
        """Initialisiert den Critic Agent."""
        self.llm = get_llm_client()
        self.system_prompt = get_system_prompt("critic")
    
    def review_code(self, state: BuilderState) -> BuilderState:
        """
        Bewertet den generierten Code.
        
        Args:
            state: Der aktuelle BuilderState mit Code
        
        Returns:
            Aktualisierter BuilderState mit Review
        """
        print("\n🔎 CRITIC AGENT - Analysiere und bewerte Code...")
        state.update_status(AgentStatus.REVIEWING)
        
        # Überprüfe, ob Code vorhanden ist
        if not state.generated_code:
            state.add_error("Kein Code vorhanden. Bitte erst Coder Agent ausführen.")
            return state
        
        # Erstelle Prompt für Code-Bewertung
        prompt = self._create_review_prompt(state.generated_code.code)
        
        try:
            # Rufe LLM auf, um Code zu bewerten
            response = self.llm.generate_text(
                prompt=prompt,
                system_prompt=self.system_prompt,
                parse_json=True,
            )
            
            # Parse die Antwort in ReviewOutput
            if isinstance(response, dict):
                review = self._parse_review_response(response)
            else:
                review = self._parse_review_response(json.loads(response))
            
            state.current_review = review
            state.reviews.append(review)
            state.quality_history.append(review.code_quality_score)
            
            print(f"✅ Code-Review abgeschlossen")
            print(f"   Qualität-Score: {review.code_quality_score}/10")
            print(f"   Probleme: {len(review.issues)}")
            print(f"   Verbesserungen: {len(review.improvements)}")
            
            # Gebe Review aus
            self._print_review(review)
            
        except Exception as e:
            error_msg = f"Fehler beim Code-Review: {str(e)}"
            state.add_error(error_msg)
            return state
        
        return state
    
    def _create_review_prompt(self, code: str) -> str:
        """
        Erstellt den Prompt für die Code-Bewertung.
        
        Args:
            code: Der zu bewertende Code
        
        Returns:
            Formatierter Prompt
        """
        return f"""
Analysiere den folgenden Python-Code gründlich und gebe detailliertes Feedback:

```python
{code}
```

Gebe deine Bewertung als JSON mit folgender Struktur zurück:

{{
    "code_quality_score": 7.5,
    "issues": [
        "Problem 1",
        "Problem 2"
    ],
    "improvements": [
        "Verbesserungsvorschlag 1",
        "Verbesserungsvorschlag 2"
    ],
    "fix_suggestions": [
        "Konkreter Fix-Vorschlag 1",
        "Konkreter Fix-Vorschlag 2"
    ],
    "root_causes": [
        "Ursache 1",
        "Ursache 2"
    ],
    "security_issues": [
        "Sicherheitsbedenken falls vorhanden"
    ],
    "overall_feedback": "Allgemeines Feedback zum Code",
    "should_refine": true
}}

Überprüfe auf:
- Syntax und Best Practices
- Performance-Probleme
- Sicherheitsprobleme
- Fehlerbehandlung
- Code-Lesbarkeit und Wartbarkeit
- Documentation und Kommentare
- Type Hints Qualität

Gebe konkrete, umsetzbare Vorschläge mit einer klaren Priorisierung.
"""
    
    def _parse_review_response(self, response_dict: dict) -> ReviewOutput:
        """
        Parst die LLM-Antwort in ein ReviewOutput-Objekt.
        
        Args:
            response_dict: Dictionary mit der Review-Information
        
        Returns:
            ReviewOutput Objekt
        """
        # Extrahiere Qualitäts-Score und stelle sicher, dass er zwischen 0-10 liegt
        score = float(response_dict.get("code_quality_score", 5.0))
        score = max(0.0, min(10.0, score))
        
        return ReviewOutput(
            code_quality_score=score,
            issues=response_dict.get("issues", []),
            improvements=response_dict.get("improvements", []),
            fix_suggestions=response_dict.get("fix_suggestions", []),
            root_causes=response_dict.get("root_causes", []),
            security_issues=response_dict.get("security_issues", []),
            overall_feedback=response_dict.get("overall_feedback", ""),
            should_refine=response_dict.get("should_refine", True),
        )
    
    def _print_review(self, review: ReviewOutput) -> None:
        """
        Gibt das Review in einer schönen Formatierung aus.
        
        Args:
            review: Das ReviewOutput-Objekt
        """
        # Bestimme Rating basierend auf Score
        if review.code_quality_score >= 8:
            rating = "⭐⭐⭐ Ausgezeichnet"
        elif review.code_quality_score >= 6:
            rating = "⭐⭐ Gut"
        elif review.code_quality_score >= 4:
            rating = "⭐ Befriedigend"
        else:
            rating = "❌ Mangelhaft"
        
        print("\n" + "=" * 70)
        print("📊 CODE REVIEW ERGEBNISSE")
        print("=" * 70)
        print(f"\nQualität-Score: {review.code_quality_score}/10 {rating}")
        print(f"Sollte verbessert werden: {'Ja ✓' if review.should_refine else 'Nein ✗'}")
        
        if review.issues:
            print("\n❌ ERKANNTE PROBLEME:")
            for i, issue in enumerate(review.issues, 1):
                print(f"   {i}. {issue}")
        
        if review.security_issues:
            print("\n🔒 SICHERHEITSBEDENKEN:")
            for i, sec_issue in enumerate(review.security_issues, 1):
                print(f"   {i}. {sec_issue}")
        
        if review.improvements:
            print("\n💡 VERBESSERUNGSVORSCHLÄGE:")
            for i, imp in enumerate(review.improvements, 1):
                print(f"   {i}. {imp}")

        if review.fix_suggestions:
            print("\n🛠️ KONKRETE FIX-VORSCHLÄGE:")
            for i, fix in enumerate(review.fix_suggestions, 1):
                print(f"   {i}. {fix}")

        if review.root_causes:
            print("\n🔎 URSACHENANALYSE:")
            for i, root in enumerate(review.root_causes, 1):
                print(f"   {i}. {root}")

        if review.overall_feedback:
            print(f"\n📝 ALLGEMEINES FEEDBACK:")
            print(f"   {review.overall_feedback}")
        
        print("\n" + "=" * 70)
