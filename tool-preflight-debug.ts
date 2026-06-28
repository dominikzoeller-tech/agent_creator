export type SensitivityLevel = "public" | "internal" | "confidential";
export type ProcessingMode = "auto" | "local" | "cloud" | "hybrid";
export type ToolRiskLevel = "low" | "medium" | "high";

export interface AgentDebugToolDefinition {
  id: string;
  label: string;
  category: string;
  enabled: boolean;
  requiresExternalNetwork: boolean;
  requiresSecret: boolean;
  writesData: boolean;
  riskLevel: ToolRiskLevel;
  allowedSensitivity: SensitivityLevel[];
}

export interface AgentDebugToolPreflightDecision {
  toolId: string;
  label: string;
  category: string;
  candidate: boolean;
  allowed: boolean;
  requiresConfirmation: boolean;
  reasons: string[];
  warnings: string[];
}

export interface AgentDebugToolPreflightResult {
  sensitivity: SensitivityLevel;
  processingMode: ProcessingMode;
  candidateToolIds: string[];
  allowedToolIds: string[];
  blockedToolIds: string[];
  decisions: AgentDebugToolPreflightDecision[];
}

const SENSITIVE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,
  /\b(?:sk-|pk_|ghp_|github_pat_|api[_-]?key|password|passwort|secret|token)\b/i,
];

export function buildAgentDebugToolPreflight(input: {
  userInput: string;
  sensitivity?: string;
  processingMode?: string;
}): AgentDebugToolPreflightResult {
  const sensitivity = normalizeSensitivity(input.sensitivity);
  const processingMode = normalizeMode(input.processingMode);
  const userInput = input.userInput ?? "";
  const tools = buildAgentDebugToolRegistry();
  const candidateIds = detectCandidateToolIds(userInput);
  const decisions = tools.map((tool) => evaluateTool(tool, candidateIds.includes(tool.id), userInput, sensitivity, processingMode));

  return {
    sensitivity,
    processingMode,
    candidateToolIds: candidateIds,
    allowedToolIds: decisions.filter((decision) => decision.candidate && decision.allowed).map((decision) => decision.toolId),
    blockedToolIds: decisions.filter((decision) => decision.candidate && !decision.allowed).map((decision) => decision.toolId),
    decisions,
  };
}

function buildAgentDebugToolRegistry(): AgentDebugToolDefinition[] {
  const webResearchEnabled = process.env.WEB_RESEARCH_ENABLED === "true";
  const governanceEnabled = process.env.WEB_RESEARCH_GOVERNANCE_ENABLED !== "false";

  return [
    {
      id: "knowledge-search",
      label: "Knowledge Search",
      category: "knowledge",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: false,
      riskLevel: "low",
      allowedSensitivity: ["public", "internal", "confidential"],
    },
    {
      id: "project-memory",
      label: "Project Memory",
      category: "memory",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: true,
      riskLevel: "medium",
      allowedSensitivity: ["public", "internal", "confidential"],
    },
    {
      id: "web-research",
      label: "Web Research",
      category: "web-research",
      enabled: webResearchEnabled,
      requiresExternalNetwork: true,
      requiresSecret: true,
      writesData: false,
      riskLevel: "high",
      allowedSensitivity: ["public"],
    },
    {
      id: "web-research-save",
      label: "Web Research Save",
      category: "web-research",
      enabled: governanceEnabled,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: true,
      riskLevel: "high",
      allowedSensitivity: ["public"],
    },
  ];
}

function detectCandidateToolIds(userInput: string): string[] {
  const text = userInput.toLowerCase();
  const candidates = new Set<string>();

  if (["knowledge", "wissensbasis", "dokument", "datei", "suche in", "finde in"].some((marker) => text.includes(marker))) {
    candidates.add("knowledge-search");
  }
  if (["memory", "gedächtnis", "merke", "erinnere", "speicher als memory"].some((marker) => text.includes(marker))) {
    candidates.add("project-memory");
  }
  if (["internet", "web", "online", "aktuell", "latest", "news", "recherche", "recherchiere", "quelle", "quellen"].some((marker) => text.includes(marker))) {
    candidates.add("web-research");
  }
  if (["speichern", "save", "knowledge speichern", "als knowledge", "research speichern"].some((marker) => text.includes(marker))) {
    candidates.add("web-research-save");
  }

  return Array.from(candidates);
}

function evaluateTool(
  tool: AgentDebugToolDefinition,
  candidate: boolean,
  userInput: string,
  sensitivity: SensitivityLevel,
  processingMode: ProcessingMode
): AgentDebugToolPreflightDecision {
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (!candidate) {
    warnings.push("Tool wurde für diese Anfrage nicht als Kandidat erkannt.");
  }
  if (!tool.enabled) {
    reasons.push("Tool ist aktuell deaktiviert.");
  }
  if (!tool.allowedSensitivity.includes(sensitivity)) {
    reasons.push(`Sensitivity ${sensitivity} ist für dieses Tool nicht erlaubt.`);
  }
  if (tool.requiresExternalNetwork && sensitivity !== "public") {
    reasons.push("Externe Netzwerktools sind nur für public Sensitivity erlaubt.");
  }
  if (tool.requiresExternalNetwork && processingMode === "local") {
    reasons.push("Processing Mode local blockiert externe Netzwerktools.");
  }
  if (tool.requiresExternalNetwork && containsSensitiveData(userInput)) {
    reasons.push("User Input enthält potenziell sensible Daten. Externe Netzwerktools werden blockiert.");
  }
  if (tool.riskLevel === "high") {
    warnings.push("High-Risk-Tool sollte transparent angezeigt und ggf. bestätigt werden.");
  }
  if (tool.writesData) {
    warnings.push("Tool schreibt dauerhaft Daten und sollte vor Ausführung bestätigt werden.");
  }

  return {
    toolId: tool.id,
    label: tool.label,
    category: tool.category,
    candidate,
    allowed: candidate && reasons.length === 0,
    requiresConfirmation: tool.riskLevel === "high" || tool.writesData,
    reasons,
    warnings,
  };
}

function containsSensitiveData(value: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}

function normalizeSensitivity(value: string | undefined): SensitivityLevel {
  if (value === "public" || value === "internal" || value === "confidential") return value;
  return "internal";
}

function normalizeMode(value: string | undefined): ProcessingMode {
  if (value === "auto" || value === "local" || value === "cloud" || value === "hybrid") return value;
  return "auto";
}
