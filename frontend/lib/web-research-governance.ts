export type GovernanceSeverity = "info" | "warning" | "error";

export interface WebResearchGovernanceIssue {
  code: string;
  severity: GovernanceSeverity;
  message: string;
}

export interface WebResearchGovernanceInput {
  query: string;
  summary?: string;
  results?: Array<{ title?: string; url?: string; snippet?: string; source?: string }>;
  sources?: Array<{ title?: string; url?: string; source?: string }>;
  saveKnowledge?: boolean;
  saveMemory?: boolean;
}

export interface WebResearchGovernanceReport {
  ok: true;
  allowed: boolean;
  score: number;
  issueCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  deduplicatedSources: Array<{ title?: string; url?: string; source?: string }>;
  issues: WebResearchGovernanceIssue[];
}

const SENSITIVE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,
  /\b(?:sk-|pk_|ghp_|github_pat_|api[_-]?key|password|passwort|secret|token)\b/i,
];

const LOW_VALUE_DOMAINS = ["localhost", "127.0.0.1"];

export function evaluateWebResearchGovernance(input: WebResearchGovernanceInput): WebResearchGovernanceReport {
  const issues: WebResearchGovernanceIssue[] = [];
  const query = normalizeText(input.query);
  const summary = normalizeText(input.summary);
  const results = input.results ?? [];
  const sources = input.sources ?? results.map((result) => ({ title: result.title, url: result.url, source: result.source }));
  const deduplicatedSources = deduplicateSources(sources);

  if (!query) {
    issues.push({ code: "missing-query", severity: "error", message: "Research Query fehlt." });
  }

  if (!summary) {
    issues.push({ code: "missing-summary", severity: "warning", message: "Research Summary fehlt oder ist leer." });
  } else if (summary.split(/\s+/).filter(Boolean).length < 20) {
    issues.push({ code: "short-summary", severity: "warning", message: "Research Summary ist sehr kurz. Bitte vor Speicherung kuratieren." });
  }

  if (results.length === 0) {
    issues.push({ code: "no-results", severity: "warning", message: "Es wurden keine Web-Research-Treffer Ã¼bergeben." });
  }

  if (deduplicatedSources.length < 2) {
    issues.push({ code: "few-sources", severity: "warning", message: "Weniger als zwei eindeutige Quellen vorhanden." });
  }

  if (sources.length !== deduplicatedSources.length) {
    issues.push({ code: "duplicate-sources", severity: "info", message: "Doppelte Quellen wurden erkannt und dedupliziert." });
  }

  for (const value of [query, summary, ...results.flatMap((result) => [result.title ?? "", result.snippet ?? "", result.url ?? ""])]) {
    if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(value))) {
      issues.push({ code: "sensitive-data", severity: "error", message: "Potentiell sensible Daten erkannt. Speicherung blockieren oder manuell bereinigen." });
      break;
    }
  }

  for (const source of deduplicatedSources) {
    const domain = safeDomain(source.url ?? "");
    if (!domain) {
      issues.push({ code: "invalid-source-url", severity: "warning", message: `Quelle ohne gÃ¼ltige URL: ${source.title ?? "Ohne Titel"}.` });
      continue;
    }
    if (LOW_VALUE_DOMAINS.includes(domain)) {
      issues.push({ code: "local-source", severity: "warning", message: `Lokale Quelle erkannt: ${domain}.` });
    }
  }

  if (input.saveMemory && summary.length > 3000) {
    issues.push({ code: "long-memory-summary", severity: "info", message: "Memory-Summary ist lang. FÃ¼r Memory besser kÃ¼rzen." });
  }

  if (!input.saveKnowledge && !input.saveMemory) {
    issues.push({ code: "nothing-selected", severity: "error", message: "Weder Knowledge noch Memory ist als Speicherziel ausgewÃ¤hlt." });
  }

  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const infoCount = issues.filter((issue) => issue.severity === "info").length;
  const score = Math.max(0, 100 - errorCount * 35 - warningCount * 12 - infoCount * 3);

  return {
    ok: true,
    allowed: errorCount === 0,
    score,
    issueCount: issues.length,
    errorCount,
    warningCount,
    infoCount,
    deduplicatedSources,
    issues,
  };
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function deduplicateSources(sources: Array<{ title?: string; url?: string; source?: string }>) {
  const seen = new Set<string>();
  const next: Array<{ title?: string; url?: string; source?: string }> = [];
  for (const source of sources) {
    const key = normalizeUrl(source.url ?? "") || normalizeText(source.title).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(source);
  }
  return next;
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function safeDomain(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

