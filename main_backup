"""
Haupteinstiegspunkt für das AI Agent Builder System.

Dieses Skript orchestriert den gesamten Agenten-Generierungsprozess:
1. Der Benutzer gibt eine Anfrage ein
2. Planner erstellt einen Plan
3. Coder generiert Code
4. Critic bewertet den Code
5. Refiner verbessert den Code (iterativ)
6. Der Code wird ausgeführt und debuggt
7. Finaler Code wird gespeichert

Nutzung:
    python main.py
"""

import logging
import sys
from pathlib import Path

# Grundlegendes Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# Füge das Projekt-Verzeichnis zum Python-Pfad hinzu
sys.path.insert(0, str(Path(__file__).parent))

from config import (
    MAX_ITERATIONS,
    QUALITY_THRESHOLD,
    OUTPUT_DIR,
    BEST_AGENT_DIR,
    EXECUTION_MAX_RETRIES,
    EXECUTION_TIMEOUT,
)
from core.state import BuilderState, AgentStatus, ReviewOutput
from agents.planner import PlannerAgent
from agents.coder import CoderAgent
from agents.critic import CriticAgent
from agents.refiner import RefinerAgent
from execution.code_executor import execute_python_code
from evaluation.evaluator import evaluate_agent, rank_variants
from memory.memory_store import save_memory
from shutil import copy2


class AgentBuilderSystem:
    """
    Hauptsystem für die automatische Agenten-Generierung.
    
    Koordiniert alle Sub-Agenten (Planner, Coder, Critic, Refiner)
    in einem iterativen Loop.
    """
    
    def __init__(self):
        """Initialisiert das Agent Builder System mit allen Sub-Agenten."""
        self.planner = PlannerAgent()
        self.coder = CoderAgent()
        self.critic = CriticAgent()
        self.refiner = RefinerAgent()
        self.state = BuilderState()
    
    def run(
        self,
        user_request: str,
        variant_label: str = "",
        variant_description: str = "",
    ) -> BuilderState:
        """
        Führt den kompletten Agenten-Generierungsprozess aus.
        
        Args:
            user_request: Die Anfrage des Benutzers (z.B. "Baue einen Trading Bot")
            variant_label: Kennzeichnet die Variante des Agents
            variant_description: Beschreibt den Fokus der Variante
        
        Returns:
            Der finale BuilderState mit generiertem Code
        """
        logger.info("AI AGENT BUILDER SYSTEM - START")
        print("\n" + "=" * 70)
        print("🚀 AI AGENT BUILDER SYSTEM - START")
        print("=" * 70)
        
        # Initialisiere State mit der Benutzeranfrage
        self.state.user_request = user_request
        self.state.variant_label = variant_label
        self.state.variant_description = variant_description
        self.state.update_status(AgentStatus.PLANNING)
        
        try:
            # Phase 1: PLANUNG
            print("\n" + "═" * 70)
            print("PHASE 1: PLANUNG")
            print("═" * 70)
            self.state = self.planner.plan(self.state)
            
            if not self.state.plan:
                raise Exception("Plan konnte nicht erstellt werden")
            
            # Phase 2: CODE-GENERIERUNG
            print("\n" + "═" * 70)
            print("PHASE 2: CODE-GENERIERUNG")
            print("═" * 70)
            self.state = self.coder.generate_code(self.state)
            
            if not self.state.generated_code:
                raise Exception("Code konnte nicht generiert werden")
            
            # Phase 3-5: REVIEW & SELF-IMPROVEMENT LOOP
            print("\n" + "═" * 70)
            print("PHASE 3-5: ITERATIVER REVIEW & SELF-IMPROVEMENT")
            print("═" * 70)
            
            self.state = self._refinement_loop()
            
            # Phase 6: AUSFÜHRUNG & DEBUG LOOP
            print("\n" + "═" * 70)
            print("PHASE 6: AUSFÜHRUNG & DEBUG LOOP")
            print("═" * 70)
            self.state = self._execution_loop()
            
            # Phase 7: SPEICHERN
            print("\n" + "═" * 70)
            print("PHASE 7: SPEICHERN")
            print("═" * 70)
            self.state = self._save_final_code()
            self._save_memory_entry()

            if self.state.execution_success is not True:
                self.state.update_status(AgentStatus.FAILED)
            else:
                self.state.update_status(AgentStatus.COMPLETED)
            
            # Gebe finale Zusammenfassung aus
            self._print_final_summary()
            
        except Exception as e:
            print(f"\n❌ FATAL ERROR: {str(e)}")
            self.state.update_status(AgentStatus.FAILED)
            self.state.add_error(str(e))
        
        print("\n" + "=" * 70)
        print("AI AGENT BUILDER SYSTEM - ENDE")
        print("=" * 70)
        
        return self.state
    
    def _refinement_loop(self) -> BuilderState:
        """
        Führt den iterativen Review- und Refinement-Loop aus.

        Loop:
        1. Critic bewertet Code
        2. Wenn Score < QUALITY_THRESHOLD oder Probleme vorhanden:
           - Refiner verbessert Code
           - Zurück zu Schritt 1
        3. Wenn Score >= QUALITY_THRESHOLD oder max Iterationen erreicht: Exit

        Returns:
            Aktualisierter BuilderState
        """
        iteration = 0

        while iteration < MAX_ITERATIONS:
            iteration += 1
            self.state.iteration_count = iteration

            print(f"\n─ ITERATION {iteration} ─")

            if not self.state.generated_code:
                print("❌ Kein Code zum Review vorhanden")
                break

            # Code bewerten
            self.state = self.critic.review_code(self.state)

            if not self.state.current_review:
                print("❌ Review konnte nicht durchgeführt werden")
                break

            quality_score = self.state.current_review.code_quality_score
            should_refine = self.state.current_review.should_refine

            if not self._is_code_plausible(self.state.generated_code.code):
                print("\n⚠️ Code wirkt nicht plausibel. Zusätzliche Verbesserungsschleife wird gestartet.")
                should_refine = True

            # Überprüfe, ob Verbesserung nötig ist
            if quality_score >= QUALITY_THRESHOLD and not should_refine:
                print(f"\n✅ QUALITÄTS-SCHWELLE ERREICHT!")
                print(f"   Score: {quality_score}/10 >= {QUALITY_THRESHOLD}")
                break

            if iteration >= MAX_ITERATIONS:
                print(f"\n⚠️  MAXIMALE ITERATIONEN ({MAX_ITERATIONS}) ERREICHT")
                break

            # Verbessere Code
            print(f"\n   Verbessere Code (Score war: {quality_score}/10)...")
            self.state = self.refiner.refine_code(self.state)

            if not self.state.generated_code:
                print("❌ Refinement konnte nicht durchgeführt werden")
                break

            print(f"   → Bereit für nächste Überprüfung")

        return self.state
    
    def _execution_loop(self) -> BuilderState:
        """
        Führt den generierten Code aus und versucht bei Laufzeitfehlern,
        den Refiner mit Debug-Informationen neu anzustoßen.
        """
        if not self.state.generated_code:
            self.state.add_error("Kein Code zum Ausführen vorhanden")
            return self.state

        max_attempts = EXECUTION_MAX_RETRIES + 1
        while self.state.execution_attempts < max_attempts:
            self.state.execution_attempts += 1
            print(f"\n─ AUSFÜHRUNGSVERSUCH {self.state.execution_attempts} ─")

            result = execute_python_code(
                self.state.generated_code.code,
                timeout=EXECUTION_TIMEOUT,
            )

            self.state.execution_success = result.success
            self.state.execution_result = result.output
            self.state.execution_error = result.error

            if result.success:
                print("\n✅ Codeausführung erfolgreich!")
                if result.output:
                    print("\n📄 Ausgabepreview:")
                    for line in result.output.splitlines()[:5]:
                        print(f"   {line}")
                    if len(result.output.splitlines()) > 5:
                        print("   ...")
                break

            print("\n❌ Codeausführung fehlgeschlagen.")
            print(f"   Fehler: {result.error or 'Keine Fehlermeldung verfügbar.'}")
            if result.output:
                print("\n   Laufzeit-Output und Fehlerdetails:")
                for line in result.output.splitlines()[:8]:
                    print(f"   {line}")
                if len(result.output.splitlines()) > 8:
                    print("   ...")

            if self.state.execution_attempts >= EXECUTION_MAX_RETRIES:
                self.state.add_error(
                    f"Code konnte nach {self.state.execution_attempts} Ausführungsversuchen nicht erfolgreich ausgeführt werden."
                )
                break

            print("\n🔄 Starte automatisches Debugging und Verfeinerung...")
            self.state.current_review = ReviewOutput(
                code_quality_score=0.0,
                issues=[f"Laufzeitfehler: {result.error or 'Unbekannter Fehler'}"],
                improvements=[
                    "Behebe den Laufzeitfehler und stelle sicher, dass der Code startbar ist."
                ],
                fix_suggestions=[result.error or "Keine Fehlermeldung."],
                root_causes=["Laufzeitfehler", "Unhandled Exception oder fehlende Abhängigkeiten"],
                overall_feedback="Bitte verbessere den Code anhand der Laufzeit-Debug-Informationen.",
                should_refine=True,
            )
            self.state = self.refiner.refine_code(
                self.state,
                execution_feedback=result.output or result.error,
            )

            if not self.state.generated_code:
                self.state.add_error("Refinement während der Ausführung konnte keinen Code zurückgeben.")
                break

        return self.state
    
    def _save_final_code(self) -> BuilderState:
        """
        Speichert den finalen Code als Datei.
        
        Returns:
            Aktualisierter BuilderState mit finalen Pfad
        """
        if not self.state.generated_code:
            self.state.add_error("Kein Code zum Speichern vorhanden")
            return self.state
        
        try:
            # Erstelle Dateiname
            agent_name = self.state.plan.agent_name if self.state.plan else "agent"
            filename = f"{agent_name}.py"
            filepath = Path(OUTPUT_DIR) / filename
            
            # Speichere Code
            filepath.write_text(self.state.generated_code.code, encoding="utf-8")
            
            self.state.final_code = self.state.generated_code.code
            self.state.final_filename = str(filepath)
            self.state.final_quality_score = (
                self.state.current_review.code_quality_score
                if self.state.current_review
                else None
            )
            
            print(f"✅ Code gespeichert: {filepath}")
            print(f"   Größe: {len(self.state.generated_code.code)} Zeichen")
            print(f"   Zeilen: {len(self.state.generated_code.code.splitlines())}")
            
        except Exception as e:
            error_msg = f"Fehler beim Speichern des Codes: {str(e)}"
            self.state.add_error(error_msg)
        
        return self.state

    def _save_memory_entry(self) -> None:
        """Speichert den finalen Task einschließlich Code und Feedback im Memory."""
        if not self.state.final_code:
            return

        feedback = self.state.current_review.overall_feedback if self.state.current_review else "Keine Rückmeldung verfügbar."
        try:
            save_memory(
                task=self.state.user_request,
                code=self.state.final_code,
                feedback=feedback,
                score=self.state.current_review.code_quality_score if self.state.current_review else None,
                success=self.state.execution_success,
                variant=self.state.variant_label,
                filename=self.state.final_filename,
                best_agent=False,
            )
            print("✅ Memory-Eintrag gespeichert.")
        except Exception as e:
            self.state.add_error(f"Fehler beim Speichern im Memory: {e}")

    def _is_code_plausible(self, code: str) -> bool:
        """Prüft einfach, ob der generierte Code plausibel aussieht."""
        if not code or not code.strip():
            return False

        normalized = code.lower()
        keywords = ["def ", "class ", "import ", "async ", "lambda "]
        return any(keyword in normalized for keyword in keywords)

    def _print_final_summary(self) -> None:
        """Gibt eine finale Zusammenfassung des gesamten Prozesses aus."""
        title = (
            "🎉 AGENTEN-GENERIERUNG ERFOLGREICH 🎉"
            if self.state.status == AgentStatus.COMPLETED
            else "⚠️ AGENTEN-GENERIERUNG ABGESCHLOSSEN ⚠️"
        )
        print("\n" + "╔" + "═" * 68 + "╗")
        print(f"║" + " " * 15 + f"{title}" + " " * 15 + "║")
        print("╚" + "═" * 68 + "╝")
        
        # Zusammenfassung
        print("\n📊 ZUSAMMENFASSUNG:")
        print(f"  • Agent Name: {self.state.plan.agent_name if self.state.plan else 'N/A'}")
        print(f"  • Benutzeranfrage: {self.state.user_request[:50]}...")
        print(f"  • Iterationen: {self.state.iteration_count}")
        print(f"  • Finaler Quality Score: {self.state.final_quality_score}/10" if self.state.final_quality_score else "  • Quality Score: N/A")
        print(f"  • Gesamtverbesserungen: {self.state.total_improvements}")
        
        if self.state.final_filename:
            print(f"\n💾 AUSGABE:")
            print(f"  • Datei: {Path(self.state.final_filename).name}")
            print(f"  • Pfad: {self.state.final_filename}")
            print(f"  • Zeilen Code: {len(self.state.generated_code.code.splitlines())}")

        if self.state.execution_success is not None:
            execution_status = "Erfolgreich" if self.state.execution_success else "Fehlgeschlagen"
            print(f"\n🚀 AUSFÜHRUNG: {execution_status} ({self.state.execution_attempts} Versuche)")
            if self.state.execution_error:
                print(f"  • Laufzeit-Fehler: {self.state.execution_error[:200]}")
            if self.state.execution_result and self.state.execution_success:
                print(f"  • Ausgabe (erste Zeilen):")
                for line in self.state.execution_result.splitlines()[:4]:
                    print(f"    {line}")
                if len(self.state.execution_result.splitlines()) > 4:
                    print("    ...")
        
        # Qualitätsverlauf
        if self.state.quality_history:
            print(f"\n📈 QUALITÄTSVERLAUF:")
            for i, score in enumerate(self.state.quality_history):
                bar = "█" * int(score) + "░" * (10 - int(score))
                print(f"  Iteration {i+1}: [{bar}] {score:.1f}/10")
        
        # Fehler (falls vorhanden)
        if self.state.errors:
            print(f"\n⚠️  WARNUNGEN/FEHLER:")
            for error in self.state.errors:
                print(f"  • {error}")


class AgentFactorySystem:
    """Factory für die Generierung, Bewertung und Auswahl mehrerer Agentenvarianten."""

    VARIANTS = [
        {"name": "v1", "label": "simple", "description": "Einfacher, leichter Ansatz mit klarer Struktur."},
        {"name": "v2", "label": "api-heavy", "description": "API-reicher Agent, der echte Datenquellen nutzt."},
        {"name": "v3", "label": "modular", "description": "Modularer Agent mit wiederverwendbarer Architektur."},
    ]

    def __init__(self):
        self.factory_state = BuilderState()

    def run(self, user_request: str) -> BuilderState:
        print("\n" + "═" * 70)
        print("🧪 AGENT FACTORY: Generiere mehrere Agentenvarianten")
        print("═" * 70)

        self.factory_state.user_request = user_request
        self.factory_state.update_status(AgentStatus.PLANNING)

        variants = self._select_variants(user_request)
        reports = []

        for index, variant in enumerate(variants, start=1):
            print(f"\n📦 Generiere Variante {index}/{len(variants)}: {variant['label']}")
            builder = AgentBuilderSystem()
            state = builder.run(
                user_request,
                variant_label=variant["label"],
                variant_description=variant["description"],
            )

            output_filename = self._save_variant_code(state, variant["name"])
            log_path = self._save_execution_log(state, variant["name"])
            score = evaluate_agent(
                state.final_code or "",
                bool(state.execution_success),
                state.execution_result,
            )

            report = {
                "variant_name": variant["name"],
                "label": variant["label"],
                "description": variant["description"],
                "score": score,
                "execution_success": bool(state.execution_success),
                "filename": output_filename,
                "log_path": log_path,
                "errors": state.errors.copy(),
            }
            reports.append(report)
            self.factory_state.variant_results.append(report)

        ranked = rank_variants(reports)
        best = ranked[0] if ranked else None

        if best:
            print(f"\n🏆 Beste Variante: {best['variant_name']} ({best['label']}) mit Score {best['score']}")
            self.factory_state.best_variant = best
            self._save_best_agent(best)
            self.factory_state.final_filename = best["filename"]
            self.factory_state.final_code = Path(best["filename"]).read_text(encoding="utf-8")
            self.factory_state.final_quality_score = best["score"]
            if not best["execution_success"]:
                self.factory_state.add_error("Der beste Agent konnte nicht erfolgreich ausgeführt werden.")

        self._save_factory_memory(user_request, ranked)

        if best and best["execution_success"]:
            self.factory_state.update_status(AgentStatus.COMPLETED)
        else:
            self.factory_state.update_status(AgentStatus.FAILED)

        return self.factory_state

    def _select_variants(self, user_request: str) -> list[dict]:
        """Bestimmt, ob mehrere Varianten generiert werden sollen."""
        lower = user_request.lower()
        if any(keyword in lower for keyword in ["trading", "bitcoin", "crypto", "finanz", "news", "aktie"]):
            return self.VARIANTS
        return self.VARIANTS[:2]

    def _save_variant_code(self, state: BuilderState, variant_suffix: str) -> str:
        if not state.final_code:
            return ""

        filename = f"agent_{variant_suffix}.py"
        filepath = Path(OUTPUT_DIR) / filename
        filepath.write_text(state.final_code, encoding="utf-8")
        return str(filepath)

    def _save_execution_log(self, state: BuilderState, variant_suffix: str) -> str:
        log_filename = f"agent_{variant_suffix}.log"
        log_path = Path(OUTPUT_DIR) / log_filename
        log_content = [
            f"Variant: {variant_suffix}",
            f"Success: {state.execution_success}",
            f"Review Score: {state.current_review.code_quality_score if state.current_review else 'N/A'}",
            "",
            "Execution Output:",
            state.execution_result or "",
            "",
            "Execution Error:",
            state.execution_error or "",
        ]
        log_path.write_text("\n".join(str(line) for line in log_content), encoding="utf-8")
        return str(log_path)

    def _save_best_agent(self, best: dict) -> None:
        if not best or not best.get("filename"):
            return
        best_path = Path(BEST_AGENT_DIR) / "best_agent.py"
        copy2(best["filename"], best_path)
        metadata_path = Path(BEST_AGENT_DIR) / "best_agent_metadata.txt"
        metadata_path.write_text(
            f"Best Variant: {best['variant_name']}\n"
            f"Label: {best['label']}\n"
            f"Score: {best['score']}\n"
            f"Execution Success: {best['execution_success']}\n"
            f"Source: {best['filename']}\n",
            encoding="utf-8",
        )

    def _save_factory_memory(self, task: str, ranked_variants: list[dict]) -> None:
        if not ranked_variants:
            return
        best = ranked_variants[0]
        try:
            save_memory(
                task=task,
                code=Path(best["filename"]).read_text(encoding="utf-8") if best.get("filename") else "",
                feedback=f"Best agent variant {best['variant_name']} with score {best['score']}",
                score=best["score"],
                success=best["execution_success"],
                variant=best["variant_name"],
                filename=best.get("filename"),
                best_agent=True,
            )
        except Exception as e:
            self.factory_state.add_error(f"Fehler beim Speichern im Memory: {e}")


def main():
    """Hauptfunktion - Einstiegspunkt des Programms."""
    print("\n")
    print("╔" + "═" * 68 + "╗")
    print("║" + " " * 10 + "🤖 WILLKOMMEN ZUM AI AGENT BUILDER SYSTEM 🤖" + " " * 14 + "║")
    print("╚" + "═" * 68 + "╝")
    
    print("\nDieses System generiert automatisch neue Agenten (Bots) für Sie!")
    print("Der Prozess:")
    print("  1️⃣  Planner erstellt einen Plan")
    print("  2️⃣  Coder generiert Code basierend auf dem Plan")
    print("  3️⃣  Critic bewertet den Code")
    print("  4️⃣  Refiner verbessert den Code iterativ")
    print("  5️⃣  Der Code wird ausgeführt und debuggt")
    print("  6️⃣  Finaler Code wird gespeichert")
    
    # Beispiele
    print("\n📝 BEISPIELE:")
    print("  • 'Baue einen Trading Bot für Bitcoin'")
    print("  • 'Erstelle einen Web-Scraper für News'")
    print("  • 'Schreibe einen Sentiment-Analyse Agent'")
    print("  • 'Entwickle einen Task-Manager Bot'")
    
    print("\n" + "─" * 70)
    
    # Benutzer-Input
    user_request = input("\n🎯 Gib deine Anfrage ein (oder 'exit' zum Beenden):\n→ ").strip()
    
    if user_request.lower() in ["exit", "quit", "q"]:
        print("Auf Wiedersehen! 👋")
        return
    
    if not user_request:
        print("❌ Bitte gib eine gültige Anfrage ein!")
        return
    
    # Starten des Systems
    print("\n")
    system = AgentFactorySystem()
    final_state = system.run(user_request)
    
    # Zeige Erfolg/Fehler an
    if final_state.status == AgentStatus.COMPLETED:
        print("\n✅ PROZESS ERFOLGREICH ABGESCHLOSSEN!")
        if final_state.best_variant and final_state.best_variant.get("filename"):
            print(f"📁 Der beste Agent wurde gespeichert unter:")
            print(f"   {final_state.best_variant.get('filename')}")
    else:
        print(f"\n❌ PROZESS FEHLGESCHLAGEN!")
        if final_state.errors:
            print("Fehler:")
            for error in final_state.errors:
                print(f"  - {error}")


if __name__ == "__main__":
    main()
