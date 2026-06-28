import { AgentDebugToolPreflightResult } from "./tool-preflight-debug";

export interface ToolEnforcementConfig {
  enabled: boolean;
  dryRun: boolean;
  blockExternalNetwork: boolean;
  blockWrites: boolean;
  requireConfirmationForHighRisk: boolean;
}

export interface ToolEnforcementPrepResult {
  enabled: boolean;
  dryRun: boolean;
  wouldBlock: boolean;
  blockedToolIds: string[];
  allowedToolIds: string[];
  confirmationRequiredToolIds: string[];
  reasons: string[];
  warnings: string[];
  mode: "off" | "dry-run" | "enforce";
}

export function getToolEnforcementConfig(): ToolEnforcementConfig {
  return {
    enabled: process.env.TOOL_PERMISSION_ENFORCEMENT_ENABLED === "true",
    dryRun: process.env.TOOL_PERMISSION_ENFORCEMENT_DRY_RUN !== "false",
    blockExternalNetwork: process.env.TOOL_PERMISSION_BLOCK_EXTERNAL_NETWORK !== "false",
    blockWrites: process.env.TOOL_PERMISSION_BLOCK_WRITES === "true",
    requireConfirmationForHighRisk: process.env.TOOL_PERMISSION_REQUIRE_CONFIRMATION_FOR_HIGH_RISK !== "false",
  };
}

export function buildToolEnforcementPrep(preflight: AgentDebugToolPreflightResult): ToolEnforcementPrepResult {
  const config = getToolEnforcementConfig();
  const candidateDecisions = preflight.decisions.filter((decision) => decision.candidate === true);
  const blockedDecisions = candidateDecisions.filter((decision) => decision.allowed === false);
  const confirmationRequiredDecisions = candidateDecisions.filter((decision) => decision.requiresConfirmation === true);

  const reasons = blockedDecisions.flatMap((decision) =>
    decision.reasons.map((reason) => `${decision.toolId}: ${reason}`)
  );
  const warnings = candidateDecisions.flatMap((decision) =>
    decision.warnings.map((warning) => `${decision.toolId}: ${warning}`)
  );

  if (!config.enabled) {
    return {
      enabled: false,
      dryRun: config.dryRun,
      wouldBlock: false,
      blockedToolIds: blockedDecisions.map((decision) => decision.toolId),
      allowedToolIds: candidateDecisions.filter((decision) => decision.allowed).map((decision) => decision.toolId),
      confirmationRequiredToolIds: confirmationRequiredDecisions.map((decision) => decision.toolId),
      reasons,
      warnings: ["Tool Permission Enforcement ist deaktiviert. Ergebnisse sind nur Beobachtung.", ...warnings],
      mode: "off",
    };
  }

  const wouldBlock = blockedDecisions.length > 0;
  const mode = config.dryRun ? "dry-run" : "enforce";

  return {
    enabled: true,
    dryRun: config.dryRun,
    wouldBlock,
    blockedToolIds: blockedDecisions.map((decision) => decision.toolId),
    allowedToolIds: candidateDecisions.filter((decision) => decision.allowed).map((decision) => decision.toolId),
    confirmationRequiredToolIds: confirmationRequiredDecisions.map((decision) => decision.toolId),
    reasons,
    warnings: config.dryRun
      ? ["Dry-Run aktiv: Der Agent Flow wird noch nicht blockiert.", ...warnings]
      : warnings,
    mode,
  };
}
