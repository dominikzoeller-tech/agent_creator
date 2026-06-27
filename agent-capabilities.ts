export type AgentCapabilityCategory =
  | "decision"
  | "privacy"
  | "planning"
  | "risk"
  | "technical"
  | "writing"
  | "research";

export interface AgentCapability {
  id: string;
  label: string;
  description: string;
  category: AgentCapabilityCategory;
  triggers: string[];
  outputs: string[];
  privacyNotes: string[];
  enabled: boolean;
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
  {
    id: "decision_agent",
    label: "Decision Agent",
    description: "Strukturiert Entscheidungen, vergleicht Optionen und leitet Empfehlungen ab.",
    category: "decision",
    triggers: [
      "entscheidung",
      "entscheiden",
      "option",
      "alternativen",
      "vergleich",
      "priorisieren",
      "empfehlung",
      "soll ich",
      "was ist besser",
      "tradeoff",
    ],
    outputs: ["recommendation", "firstStep", "confidence", "tradeoffs"],
    privacyNotes: ["Kann mit allen Sensitivitäten arbeiten, muss aber API-Processing-Policy respektieren."],
    enabled: true,
  },
  {
    id: "privacy_agent",
    label: "Privacy Agent",
    description: "Bewertet Datenschutz, Sensitivität, Redaction und Cloud-/Lokal-Verarbeitung.",
    category: "privacy",
    triggers: [
      "datenschutz",
      "privacy",
      "sensitiv",
      "confidential",
      "restricted",
      "personenbezogen",
      "geheim",
      "redaction",
      "redigieren",
      "maskieren",
      "cloud",
      "lokal",
    ],
    outputs: ["privacyRisk", "processingRecommendation", "redactionRequired", "reason"],
    privacyNotes: ["Soll bevorzugt bei confidential/restricted Anfragen beteiligt werden."],
    enabled: true,
  },
  {
    id: "planning_agent",
    label: "Planning Agent",
    description: "Erstellt Roadmaps, Phasenmodelle, Meilensteine und nächste Umsetzungsschritte.",
    category: "planning",
    triggers: [
      "plan",
      "planung",
      "phase",
      "roadmap",
      "schritt",
      "nächster schritt",
      "meilenstein",
      "umsetzen",
      "weiter machen",
      "backlog",
    ],
    outputs: ["plan", "milestones", "nextActions"],
    privacyNotes: ["Soll keine sensiblen Inhalte in externe Planungskontexte weitergeben."],
    enabled: true,
  },
  {
    id: "risk_agent",
    label: "Risk Agent",
    description: "Prüft Risiken, Nebenwirkungen, Schwachstellen und Gegenmaßnahmen.",
    category: "risk",
    triggers: [
      "risiko",
      "risk",
      "sicherheit",
      "fehler",
      "problem",
      "schwachstelle",
      "härtung",
      "absichern",
      "kritisch",
      "gefährlich",
      "rollback",
    ],
    outputs: ["risks", "mitigations", "watchouts"],
    privacyNotes: ["Soll Sicherheits- und Datenschutzrisiken explizit benennen."],
    enabled: true,
  },
  {
    id: "technical_agent",
    label: "Technical Agent",
    description: "Unterstützt technische Umsetzung, Code, Tests, Docker, API und Frontend.",
    category: "technical",
    triggers: [
      "typescript",
      "node",
      "docker",
      "compose",
      "api",
      "frontend",
      "next.js",
      "react",
      "code",
      "datei",
      "build",
      "test",
      "npm",
      "package.json",
      "endpoint",
    ],
    outputs: ["implementationNotes", "filesToChange", "commands", "testPlan"],
    privacyNotes: ["Soll bei Code- und Infrastrukturänderungen keine Secrets ausgeben."],
    enabled: true,
  },
  {
    id: "writing_agent",
    label: "Writing Agent",
    description: "Erstellt und verbessert Dokumentation, README, Runbooks, Changelogs und UI-Texte.",
    category: "writing",
    triggers: [
      "readme",
      "doku",
      "dokumentation",
      "runbook",
      "changelog",
      "text",
      "beschreibung",
      "formulieren",
      "umschreiben",
      "erklären",
    ],
    outputs: ["draft", "summary", "improvements"],
    privacyNotes: ["Soll Beispiele ohne echte Secrets oder personenbezogene Daten formulieren."],
    enabled: true,
  },
  {
    id: "research_agent",
    label: "Research Agent",
    description: "Sammelt Informationen, vergleicht Optionen und bereitet Rechercheergebnisse strukturiert auf.",
    category: "research",
    triggers: [
      "recherche",
      "research",
      "vergleich",
      "best practice",
      "aktuell",
      "neueste",
      "stand heute",
      "quelle",
      "bewertung",
    ],
    outputs: ["findings", "sources", "recommendation"],
    privacyNotes: ["Muss klar zwischen lokalem Wissen, Projektwissen und Web-Recherche unterscheiden."],
    enabled: true,
  },
];

export function getAgentCapabilities(): AgentCapability[] {
  return [...AGENT_CAPABILITIES];
}

export function getEnabledAgentCapabilities(): AgentCapability[] {
  return AGENT_CAPABILITIES.filter((capability) => capability.enabled);
}

export function getAgentCapabilityById(id: string): AgentCapability | undefined {
  return AGENT_CAPABILITIES.find((capability) => capability.id === id);
}

export function suggestAgentCapabilities(userInput: string): AgentCapability[] {
  const normalizedInput = normalizeText(userInput);
  const scored = getEnabledAgentCapabilities()
    .map((capability) => ({
      capability,
      score: scoreCapability(capability, normalizedInput),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.capability.id.localeCompare(b.capability.id));

  if (scored.length === 0) {
    const decisionAgent = getAgentCapabilityById("decision_agent");
    return decisionAgent ? [decisionAgent] : [];
  }

  return scored.map((entry) => entry.capability);
}

function scoreCapability(capability: AgentCapability, normalizedInput: string): number {
  return capability.triggers.reduce((score, trigger) => {
    const normalizedTrigger = normalizeText(trigger);
    if (!normalizedTrigger) return score;
    return normalizedInput.includes(normalizedTrigger) ? score + 1 : score;
  }, 0);
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
