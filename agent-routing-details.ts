import { suggestAgentCapabilities } from "./agent-capabilities";

export type CouncilRoute = "direct" | "council";
export type RoutingLevel = "low" | "medium" | "high";
export type DataSensitivity = "public" | "internal" | "confidential" | "restricted";
export type ProcessingMode = "auto" | "local_only" | "hybrid" | "cloud_allowed";

export interface RoutingDetails {
  route: CouncilRoute;
  reason: string;
  suggestedAgents: string[];
  complexity: RoutingLevel;
  privacyRisk: RoutingLevel;
  decisionNeed: boolean;
  implementationNeed: boolean;
  planningNeed: boolean;
  riskNeed: boolean;
}

export interface RouteAnalysisInput {
  userInput: string;
  sensitivity?: DataSensitivity;
  processingMode?: ProcessingMode;
  includeCouncilResult?: boolean;
}

const COMPLEXITY_KEYWORDS = [
  "architektur",
  "deployment",
  "docker",
  "strategie",
  "roadmap",
  "phase",
  "entscheidung",
  "option",
  "vergleich",
  "risiko",
  "security",
  "datenschutz",
  "integration",
  "migration",
  "produktiv",
  "skalieren",
];

const DECISION_KEYWORDS = [
  "soll ich",
  "entscheidung",
  "entscheiden",
  "option",
  "alternativen",
  "vergleich",
  "priorisieren",
  "empfehlung",
  "was ist besser",
];

const IMPLEMENTATION_KEYWORDS = [
  "code",
  "datei",
  "typescript",
  "docker",
  "compose",
  "api",
  "frontend",
  "endpoint",
  "package.json",
  "build",
  "test",
  "npm",
  "implementieren",
  "einbauen",
];

const PLANNING_KEYWORDS = [
  "plan",
  "planung",
  "roadmap",
  "phase",
  "meilenstein",
  "schritt",
  "nächster schritt",
  "weiter",
  "backlog",
];

const RISK_KEYWORDS = [
  "risiko",
  "fehler",
  "sicherheit",
  "security",
  "härtung",
  "absichern",
  "problem",
  "rollback",
  "kritisch",
];

const PRIVACY_KEYWORDS = [
  "privacy",
  "datenschutz",
  "sensitiv",
  "confidential",
  "restricted",
  "personenbezogen",
  "geheim",
  "redaction",
  "redigieren",
  "maskieren",
];

export function analyzeCouncilRouting(input: RouteAnalysisInput): RoutingDetails {
  const userInput = input.userInput ?? "";
  const normalized = normalizeText(userInput);
  const suggestedAgents = suggestAgentCapabilities(userInput).map((agent) => agent.id);

  const complexity = inferComplexity(normalized, suggestedAgents.length);
  const privacyRisk = inferPrivacyRisk(normalized, input.sensitivity);
  const decisionNeed = containsAny(normalized, DECISION_KEYWORDS);
  const implementationNeed = containsAny(normalized, IMPLEMENTATION_KEYWORDS);
  const planningNeed = containsAny(normalized, PLANNING_KEYWORDS);
  const riskNeed = containsAny(normalized, RISK_KEYWORDS);
  const privacyNeed = privacyRisk !== "low" || containsAny(normalized, PRIVACY_KEYWORDS);

  const shouldUseCouncil =
    input.includeCouncilResult === true ||
    input.processingMode === "hybrid" ||
    input.processingMode === "local_only" ||
    complexity === "high" ||
    privacyRisk === "high" ||
    countTrue([decisionNeed, implementationNeed, planningNeed, riskNeed, privacyNeed]) >= 2 ||
    suggestedAgents.length >= 3;

  const route: CouncilRoute = shouldUseCouncil ? "council" : "direct";
  const reason = buildRoutingReason({
    route,
    complexity,
    privacyRisk,
    decisionNeed,
    implementationNeed,
    planningNeed,
    riskNeed,
    suggestedAgents,
  });

  return {
    route,
    reason,
    suggestedAgents,
    complexity,
    privacyRisk,
    decisionNeed,
    implementationNeed,
    planningNeed,
    riskNeed,
  };
}

function inferComplexity(normalizedInput: string, suggestedAgentCount: number): RoutingLevel {
  const keywordScore = countMatches(normalizedInput, COMPLEXITY_KEYWORDS);
  const lengthScore = normalizedInput.length > 240 ? 2 : normalizedInput.length > 120 ? 1 : 0;
  const agentScore = suggestedAgentCount >= 4 ? 2 : suggestedAgentCount >= 2 ? 1 : 0;
  const total = keywordScore + lengthScore + agentScore;

  if (total >= 5) return "high";
  if (total >= 2) return "medium";
  return "low";
}

function inferPrivacyRisk(normalizedInput: string, sensitivity?: DataSensitivity): RoutingLevel {
  if (sensitivity === "restricted") return "high";
  if (sensitivity === "confidential") return "medium";
  const privacyScore = countMatches(normalizedInput, PRIVACY_KEYWORDS);
  if (privacyScore >= 2) return "high";
  if (privacyScore === 1) return "medium";
  return "low";
}

function buildRoutingReason(details: Omit<RoutingDetails, "reason">): string {
  const reasons: string[] = [];

  reasons.push(`Route ${details.route}, weil die Komplexität als ${details.complexity} bewertet wurde.`);
  reasons.push(`Privacy-Risiko: ${details.privacyRisk}.`);

  if (details.decisionNeed) reasons.push("Entscheidungsbedarf erkannt.");
  if (details.implementationNeed) reasons.push("Technischer Umsetzungsbedarf erkannt.");
  if (details.planningNeed) reasons.push("Planungs-/Roadmap-Bedarf erkannt.");
  if (details.riskNeed) reasons.push("Risiko-/Härtungsbedarf erkannt.");
  if (details.suggestedAgents.length > 0) {
    reasons.push(`Vorgeschlagene Agenten: ${details.suggestedAgents.join(", ")}.`);
  }

  return reasons.join(" ");
}

function countMatches(value: string, keywords: string[]): number {
  return keywords.reduce((count, keyword) => (value.includes(normalizeText(keyword)) ? count + 1 : count), 0);
}

function containsAny(value: string, keywords: string[]): boolean {
  return keywords.some((keyword) => value.includes(normalizeText(keyword)));
}

function countTrue(values: boolean[]): number {
  return values.filter(Boolean).length;
}

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}
