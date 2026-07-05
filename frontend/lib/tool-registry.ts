export type ToolRiskLevel = "low" | "medium" | "high";
export type ToolCategory = "core" | "knowledge" | "memory" | "web-research" | "analytics" | "system";

export interface AgentToolDefinition {
  id: string;
  label: string;
  description: string;
  category: ToolCategory;
  route?: string;
  apiRoute?: string;
  enabled: boolean;
  requiresExternalNetwork: boolean;
  requiresSecret: boolean;
  writesData: boolean;
  riskLevel: ToolRiskLevel;
  allowedSensitivity: Array<"public" | "internal" | "confidential">;
  governanceNotes: string[];
}

export interface ToolRegistryResponse {
  ok: true;
  totalTools: number;
  enabledTools: number;
  externalNetworkTools: number;
  writeTools: number;
  tools: AgentToolDefinition[];
}

function envEnabled(value: string | undefined, defaultValue = true): boolean {
  if (value === undefined || value === "") return defaultValue;
  return value === "true";
}

export function buildToolRegistry(): ToolRegistryResponse {
  const webResearchEnabled = process.env.WEB_RESEARCH_ENABLED === "true";
  const governanceEnabled = process.env.WEB_RESEARCH_GOVERNANCE_ENABLED !== "false";

  const tools: AgentToolDefinition[] = [
    {
      id: "chat-agent",
      label: "Chat Agent",
      description: "Haupt-Chatflow mit lokalem Agent Routing.",
      category: "core",
      route: "/",
      apiRoute: "/ask",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: true,
      writesData: false,
      riskLevel: "medium",
      allowedSensitivity: ["public", "internal", "confidential"],
      governanceNotes: ["Nutzt je nach Konfiguration das LLM Ã¼ber den API-Container.", "Keine Secrets im Debug JSON anzeigen."],
    },
    {
      id: "knowledge-search",
      label: "Knowledge Search",
      description: "Lokale Knowledge-Dateien durchsuchen und als Kontext nutzen.",
      category: "knowledge",
      route: "/knowledge",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: false,
      riskLevel: "low",
      allowedSensitivity: ["public", "internal", "confidential"],
      governanceNotes: ["Nutzt lokale Dateien aus knowledge/.", "Keine externen Netzwerkzugriffe."],
    },
    {
      id: "knowledge-admin",
      label: "Knowledge Admin",
      description: "Knowledge-Dateien ansehen und verwalten.",
      category: "knowledge",
      route: "/knowledge",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: true,
      riskLevel: "medium",
      allowedSensitivity: ["public", "internal", "confidential"],
      governanceNotes: ["Ã„nderungen wirken dauerhaft auf lokale Knowledge-Dateien."],
    },
    {
      id: "project-memory",
      label: "Project Memory",
      description: "Strukturierte Projektfakten suchen und im Agent Flow nutzen.",
      category: "memory",
      route: "/memory",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: true,
      riskLevel: "medium",
      allowedSensitivity: ["public", "internal", "confidential"],
      governanceNotes: ["Speichert in memory/project-memory.json.", "Memory-EintrÃ¤ge sollten kurz, prÃ¼fbar und getaggt sein."],
    },
    {
      id: "web-research",
      label: "Web Research",
      description: "Kontrollierte Websuche Ã¼ber Bing Search API.",
      category: "web-research",
      route: "/web-research",
      apiRoute: "/api/web-research",
      enabled: webResearchEnabled,
      requiresExternalNetwork: true,
      requiresSecret: true,
      writesData: false,
      riskLevel: "high",
      allowedSensitivity: ["public"],
      governanceNotes: ["Nur Ã¶ffentliche Queries verwenden.", "WEB_RESEARCH_ENABLED muss explizit true sein.", "BING_SEARCH_API_KEY wird nie angezeigt."],
    },
    {
      id: "web-research-save",
      label: "Web Research Save",
      description: "GeprÃ¼fte Web-Research-Ergebnisse als Knowledge/Memory speichern.",
      category: "web-research",
      route: "/web-research-save",
      apiRoute: "/api/web-research-save",
      enabled: governanceEnabled,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: true,
      riskLevel: "high",
      allowedSensitivity: ["public"],
      governanceNotes: ["Speicherung wird durch Governance geprÃ¼ft.", "Nur kuratierte Ã¶ffentliche Inhalte speichern."],
    },
    {
      id: "analytics",
      label: "Analytics",
      description: "Lokale Logs und Nutzungsmetriken auswerten.",
      category: "analytics",
      route: "/analytics",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: false,
      riskLevel: "low",
      allowedSensitivity: ["public", "internal", "confidential"],
      governanceNotes: ["Zeigt aggregierte lokale Daten.", "Keine Secret-Werte anzeigen."],
    },
    {
      id: "system-status",
      label: "System Status",
      description: "Systemseiten, Health und Konfigurationshinweise.",
      category: "system",
      route: "/system",
      enabled: true,
      requiresExternalNetwork: false,
      requiresSecret: false,
      writesData: false,
      riskLevel: "low",
      allowedSensitivity: ["public", "internal", "confidential"],
      governanceNotes: ["Darf Status zeigen, aber keine Secret-Werte."],
    },
  ];

  return {
    ok: true,
    totalTools: tools.length,
    enabledTools: tools.filter((tool) => tool.enabled).length,
    externalNetworkTools: tools.filter((tool) => tool.requiresExternalNetwork).length,
    writeTools: tools.filter((tool) => tool.writesData).length,
    tools,
  };
}

