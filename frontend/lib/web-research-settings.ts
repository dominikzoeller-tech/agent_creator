export interface WebResearchSettingsStatus {
  ok: true;
  webResearchEnabled: boolean;
  bingSearchConfigured: boolean;
  bingEndpointConfigured: boolean;
  bingEndpointHost?: string;
  openAiConfigured: boolean;
  summaryModel: string;
  governanceEnabled: boolean;
  safeMode: boolean;
  notes: string[];
}

function hasValue(value: string | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function safeHost(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
}

export function getWebResearchSettingsStatus(): WebResearchSettingsStatus {
  const webResearchEnabled = process.env.WEB_RESEARCH_ENABLED === "true";
  const bingSearchConfigured = hasValue(process.env.BING_SEARCH_API_KEY);
  const bingEndpointConfigured = hasValue(process.env.BING_SEARCH_ENDPOINT);
  const openAiConfigured = hasValue(process.env.OPENAI_API_KEY);
  const summaryModel = process.env.WEB_RESEARCH_SUMMARY_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const governanceEnabled = process.env.WEB_RESEARCH_GOVERNANCE_ENABLED !== "false";
  const safeMode = process.env.WEB_RESEARCH_SAFE_MODE !== "false";

  const notes: string[] = [];
  if (!webResearchEnabled) notes.push("Web Research ist deaktiviert. Setze WEB_RESEARCH_ENABLED=true, um Websuche zu aktivieren.");
  if (webResearchEnabled && !bingSearchConfigured) notes.push("BING_SEARCH_API_KEY fehlt. Websuche ist aktiviert, kann aber keine echten Ergebnisse laden.");
  if (webResearchEnabled && bingSearchConfigured) notes.push("Bing Search ist konfiguriert. Bitte nur öffentliche, nicht-sensitive Queries verwenden.");
  if (!openAiConfigured) notes.push("OPENAI_API_KEY fehlt. AI Research Summary ist nicht verfügbar.");
  if (!governanceEnabled) notes.push("Governance ist deaktiviert. Dauerhafte Speicherung sollte dann manuell besonders geprüft werden.");
  if (!safeMode) notes.push("Safe Mode ist deaktiviert. Das ist nur für lokale Tests empfohlen.");

  return {
    ok: true,
    webResearchEnabled,
    bingSearchConfigured,
    bingEndpointConfigured,
    bingEndpointHost: safeHost(process.env.BING_SEARCH_ENDPOINT),
    openAiConfigured,
    summaryModel,
    governanceEnabled,
    safeMode,
    notes,
  };
}
