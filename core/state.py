"""
State Management für das AI Agent Builder System.

Definiert alle Datenklassen und Zustandsverwaltung für den
Agenten-Generierungsprozess.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any
from enum import Enum


class AgentStatus(str, Enum):
    """Status eines generierten Agenten."""
    PLANNING = "planning"
    CODING = "coding"
    REVIEWING = "reviewing"
    REFINING = "refining"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class PlanStep:
    """Einzelner Schritt im Generierungsplan."""
    step_number: int
    title: str
    description: str
    implementation_notes: str


@dataclass
class PlanOutput:
    """Output vom Planner Agent."""
    user_request: str
    agent_name: str
    agent_description: str
    plan_steps: List[PlanStep]
    estimated_complexity: str  # "low", "medium", "high"
    required_apis: List[Dict[str, str]] = field(default_factory=list)
    potential_challenges: List[str] = field(default_factory=list)
    module_structure: str = ""


@dataclass
class AgentVariantResult:
    """Zusammenfassung einer generierten Agentenvariante."""
    variant_name: str
    label: str
    description: str
    generated_code: Optional["CodeOutput"] = None
    review: Optional["ReviewOutput"] = None
    execution_success: Optional[bool] = None
    execution_result: str = ""
    execution_error: Optional[str] = None
    evaluation_score: Optional[float] = None
    filename: Optional[str] = None
    log_path: Optional[str] = None


@dataclass
class CodeOutput:
    """Output vom Coder Agent."""
    code: str
    language: str = "python"
    filename: str = ""
    explanations: Dict[str, str] = field(default_factory=dict)


@dataclass
class ReviewOutput:
    """Output vom Critic Agent."""
    code_quality_score: float  # 0-10
    issues: List[str] = field(default_factory=list)
    improvements: List[str] = field(default_factory=list)
    security_issues: List[str] = field(default_factory=list)
    overall_feedback: str = ""
    fix_suggestions: List[str] = field(default_factory=list)
    root_causes: List[str] = field(default_factory=list)
    should_refine: bool = True


@dataclass
class RefineOutput:
    """Output vom Refiner Agent."""
    refined_code: str
    changes_made: List[str] = field(default_factory=list)
    improvement_score: float = 0.0  # Wie viel Verbesserung wurde gemacht (0-1)


@dataclass
class BuilderState:
    """
    Hauptzustandsverwaltung für den gesamten Agenten-Generierungsprozess.
    
    Alle Agenten schreiben und lesen aus diesem State-Objekt.
    """
    # Eingabe vom Benutzer
    user_request: str = ""
    
    # Status Tracking
    status: AgentStatus = AgentStatus.PLANNING
    iteration_count: int = 0
    
    # Plan Phase
    plan: Optional[PlanOutput] = None
    
    # Code Generation Phase
    generated_code: Optional[CodeOutput] = None
    code_version: int = 0
    
    # Kritik Phase
    reviews: List[ReviewOutput] = field(default_factory=list)
    current_review: Optional[ReviewOutput] = None
    
    # Verbesserung Phase
    refinements: List[RefineOutput] = field(default_factory=list)
    current_refinement: Optional[RefineOutput] = None
    
    # Metriken
    quality_history: List[float] = field(default_factory=list)
    total_improvements: int = 0
    execution_attempts: int = 0
    execution_success: Optional[bool] = None
    execution_result: str = ""
    execution_error: Optional[str] = None

    # Agent Factory Metadata
    variant_label: str = ""
    variant_description: str = ""
    variant_results: List[AgentVariantResult] = field(default_factory=list)
    best_variant: Optional[AgentVariantResult] = None
    
    # Finales Ergebnis
    final_code: Optional[str] = None
    final_filename: Optional[str] = None
    final_quality_score: Optional[float] = None
    
    # Erweiterte Agenten-Informationen
    api_recommendations: List[Dict[str, str]] = field(default_factory=list)
    web_research_summary: str = ""
    memory_matches: List[Dict[str, str]] = field(default_factory=list)
    
    # Fehlerbehandlung
    errors: List[str] = field(default_factory=list)
    
    def add_error(self, error: str) -> None:
        """Fügt einen Fehler zur Fehler-Liste hinzu."""
        self.errors.append(error)
        print(f"❌ Fehler: {error}")
    
    def update_status(self, new_status: AgentStatus) -> None:
        """Aktualisiert den Status und gibt Nachricht aus."""
        self.status = new_status
        print(f"📊 Status: {new_status.value.upper()}")
    
    def get_summary(self) -> str:
        """Gibt eine Zusammenfassung des aktuellen Zustands aus."""
        summary = f"""
╔════════════════════════════════════════════════════════════╗
║           AI AGENT BUILDER - ZUSTANDSZUSAMMENFASSUNG       ║
╚════════════════════════════════════════════════════════════╝

📝 Benutzeranfrage: {self.user_request[:60]}...
📊 Status: {self.status.value.upper()}
🔄 Iteration: {self.iteration_count}

Plan erstellt: {'✓' if self.plan else '✗'}
Code generiert: {'✓' if self.generated_code else '✗'}
Kritiken eingegangen: {len(self.reviews)}
Verbesserungen durchgeführt: {len(self.refinements)}

Qualitätsverlauf: {[f'{q:.1f}' for q in self.quality_history[-3:]]}
Gesamtverbesserungen: {self.total_improvements}
Variante: {self.variant_label or 'Standard'}
Ausführung: {'Erfolgreich' if self.execution_success else ('Fehlgeschlagen' if self.execution_success is False else 'Nicht ausgeführt')}
Ausführungsversuche: {self.execution_attempts}
Bestes Ergebnis: {self.best_variant.variant_name if self.best_variant else 'Noch nicht bewertet'}

{'Fehler: ' + ', '.join(self.errors) if self.errors else '✓ Keine Fehler'}
════════════════════════════════════════════════════════════
"""
        return summary
