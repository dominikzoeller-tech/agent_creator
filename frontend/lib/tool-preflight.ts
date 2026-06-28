import { buildToolRegistry, AgentToolDefinition } from "./tool-registry";
import { evaluateToolPermission, ProcessingMode, SensitivityLevel, ToolPermissionDecision } from "./tool-permissions";

export interface ToolPreflightInput {
  toolId: string;
  userInput?: string;
  sensitivity?: SensitivityLevel;
  processingMode?: ProcessingMode;
  requireConfirmation?: boolean;
}

export interface ToolPreflightResult {
  ok: true;
  toolId: string;
  found: boolean;
  allowed: boolean;
  requiresConfirmation: boolean;
  sensitivity: SensitivityLevel;
  processingMode: ProcessingMode;
  decision?: ToolPermissionDecision;
  tool?: AgentToolDefinition;
  reasons: string[];
  warnings: string[];
  debug: {
    userInputLength: number;
    externalNetwork: boolean;
    writesData: boolean;
    riskLevel?: string;
  };
}

const SENSITIVE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,
  /\b(?:sk-|pk_|ghp_|github_pat_|api[_-]?key|password|passwort|secret|token)\b/i,
];

export function runToolPreflight(input: ToolPreflightInput): ToolPreflightResult {
  const sensitivity = input.sensitivity ?? "internal";
  const processingMode = input.processingMode ?? "auto";
  const userInput = input.userInput ?? "";
  const registry = buildToolRegistry();
  const tool = registry.tools.find((candidate) => candidate.id === input.toolId);

  if (!tool) {
    return {
      ok: true,
      toolId: input.toolId,
      found: false,
      allowed: false,
      requiresConfirmation: false,
      sensitivity,
      processingMode,
      reasons: ["Tool wurde in der Registry nicht gefunden."],
      warnings: [],
      debug: {
        userInputLength: userInput.length,
        externalNetwork: false,
        writesData: false,
      },
    };
  }

  const decision = evaluateToolPermission(tool, sensitivity, processingMode);
  const reasons = [...decision.reasons];
  const warnings = [...decision.warnings];

  if (tool.requiresExternalNetwork && containsSensitiveData(userInput)) {
    reasons.push("User Input enthält potenziell sensible Daten. Externe Netzwerktools werden blockiert.");
  }

  if (tool.category === "web-research" && userInput.trim().length === 0) {
    warnings.push("Web-Research-Tool ohne User Input/Query angefragt.");
  }

  const requiresConfirmation = input.requireConfirmation === true || tool.writesData || tool.riskLevel === "high";
  if (requiresConfirmation) {
    warnings.push("Preflight empfiehlt manuelle Bestätigung vor Tool-Ausführung.");
  }

  return {
    ok: true,
    toolId: input.toolId,
    found: true,
    allowed: reasons.length === 0,
    requiresConfirmation,
    sensitivity,
    processingMode,
    decision,
    tool,
    reasons,
    warnings,
    debug: {
      userInputLength: userInput.length,
      externalNetwork: tool.requiresExternalNetwork,
      writesData: tool.writesData,
      riskLevel: tool.riskLevel,
    },
  };
}

function containsSensitiveData(value: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(value));
}
