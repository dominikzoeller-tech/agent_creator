import { buildToolRegistry, AgentToolDefinition } from "./tool-registry";

export type SensitivityLevel = "public" | "internal" | "confidential";
export type ProcessingMode = "auto" | "local" | "cloud" | "hybrid";

export interface ToolPermissionDecision {
  toolId: string;
  label: string;
  category: string;
  allowed: boolean;
  sensitivity: SensitivityLevel;
  processingMode: ProcessingMode;
  reasons: string[];
  warnings: string[];
}

export interface ToolPermissionsMatrixResponse {
  ok: true;
  sensitivity: SensitivityLevel;
  processingMode: ProcessingMode;
  totalTools: number;
  allowedTools: number;
  blockedTools: number;
  decisions: ToolPermissionDecision[];
}

export function buildToolPermissionsMatrix(
  sensitivity: SensitivityLevel = "internal",
  processingMode: ProcessingMode = "auto"
): ToolPermissionsMatrixResponse {
  const registry = buildToolRegistry();
  const decisions = registry.tools.map((tool) => evaluateToolPermission(tool, sensitivity, processingMode));

  return {
    ok: true,
    sensitivity,
    processingMode,
    totalTools: decisions.length,
    allowedTools: decisions.filter((decision) => decision.allowed).length,
    blockedTools: decisions.filter((decision) => !decision.allowed).length,
    decisions,
  };
}

export function evaluateToolPermission(
  tool: AgentToolDefinition,
  sensitivity: SensitivityLevel,
  processingMode: ProcessingMode
): ToolPermissionDecision {
  const reasons: string[] = [];
  const warnings: string[] = [];

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

  if (tool.requiresSecret && processingMode === "local") {
    warnings.push("Tool benötigt Secrets; im local Mode ist Nutzung nur möglich, wenn API-Container/Server diese sicher hält.");
  }

  if (tool.writesData && sensitivity === "confidential" && tool.category === "web-research") {
    reasons.push("Web-Research-Schreibtools dürfen keine confidential Inhalte speichern.");
  }

  if (tool.riskLevel === "high" && processingMode === "auto") {
    warnings.push("High-Risk-Tool sollte bei auto Mode transparent im Debug/Frontend angezeigt werden.");
  }

  if (tool.writesData) {
    warnings.push("Tool schreibt dauerhaft Daten und sollte vor Ausführung bestätigt/geprüft werden.");
  }

  return {
    toolId: tool.id,
    label: tool.label,
    category: tool.category,
    allowed: reasons.length === 0,
    sensitivity,
    processingMode,
    reasons,
    warnings,
  };
}
