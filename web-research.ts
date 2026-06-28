export interface WebResearchResult {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface WebResearchResponse {
  ok: true;
  enabled: boolean;
  query: string;
  provider: "bing" | "disabled";
  results: WebResearchResult[];
  message?: string;
}

export interface WebResearchOptions {
  query: string;
  count?: number;
}

const DEFAULT_BING_ENDPOINT = "https://api.bing.microsoft.com/v7.0/search";
const SENSITIVE_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,
  /\b(?:sk-|pk_|ghp_|github_pat_|api[_-]?key|password|passwort|secret|token)\b/i,
];

export function shouldUseWebResearch(userInput: string): boolean {
  if (process.env.WEB_RESEARCH_ENABLED !== "true") return false;

  const text = userInput.toLowerCase();
  const intentMarkers = [
    "internet",
    "web",
    "online",
    "recherche",
    "recherchieren",
    "aktuell",
    "neuste",
    "neueste",
    "latest",
    "today",
    "heute",
    "news",
    "quelle",
    "quellen",
  ];

  return intentMarkers.some((marker) => text.includes(marker));
}

export function sanitizeWebResearchQuery(userInput: string): { allowed: boolean; query: string; reason?: string } {
  const compact = userInput.replace(/\s+/g, " ").trim();
  if (!compact) return { allowed: false, query: "", reason: "Leere Web-Research-Anfrage." };

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(compact)) {
      return {
        allowed: false,
        query: "",
        reason: "Web Research wurde wegen potenziell sensibler Daten blockiert.",
      };
    }
  }

  return { allowed: true, query: compact.slice(0, 300) };
}

export function buildWebResearchContextLines(response: WebResearchResponse): string[] {
  if (!response.enabled || response.results.length === 0) return [];

  return [
    "Web-Research-Kontext:",
    ...response.results.map((result, index) =>
      `Web Result ${index + 1}: ${result.title} | ${result.url} | ${result.snippet}`
    ),
  ];
}

export function mergeWebResearchContext(existingContext: string[] = [], response: WebResearchResponse): string[] {
  const lines = buildWebResearchContextLines(response);
  if (lines.length === 0) return [...existingContext];
  return [...existingContext, ...lines];
}

export async function runWebResearch(options: WebResearchOptions): Promise<WebResearchResponse> {
  const query = options.query.trim();
  const count = Math.max(1, Math.min(options.count ?? 5, 10));
  const enabled = process.env.WEB_RESEARCH_ENABLED === "true";

  if (!query) {
    return {
      ok: true,
      enabled,
      query,
      provider: enabled ? "bing" : "disabled",
      results: [],
      message: "Keine Suchanfrage angegeben.",
    };
  }

  if (!enabled) {
    return {
      ok: true,
      enabled: false,
      query,
      provider: "disabled",
      results: [],
      message: "Web Research ist deaktiviert.",
    };
  }

  const apiKey = process.env.BING_SEARCH_API_KEY;
  if (!apiKey) {
    return {
      ok: true,
      enabled: true,
      query,
      provider: "bing",
      results: [],
      message: "BING_SEARCH_API_KEY fehlt. Web Research ist vorbereitet, aber noch nicht konfiguriert.",
    };
  }

  const endpoint = process.env.BING_SEARCH_ENDPOINT || DEFAULT_BING_ENDPOINT;
  const url = new URL(endpoint);
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(count));
  url.searchParams.set("textDecorations", "false");
  url.searchParams.set("textFormat", "Raw");

  const response = await fetch(url, {
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Bing Search Fehler: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    webPages?: {
      value?: Array<{ name?: string; url?: string; snippet?: string; displayUrl?: string }>;
    };
  };

  const results = (data.webPages?.value ?? [])
    .map((item) => ({
      title: item.name ?? "Ohne Titel",
      url: item.url ?? "",
      snippet: item.snippet ?? "",
      source: item.displayUrl,
    }))
    .filter((item) => item.url);

  return {
    ok: true,
    enabled: true,
    query,
    provider: "bing",
    results,
  };
}
