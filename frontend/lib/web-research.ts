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
      message: "Web Research ist deaktiviert. Setze WEB_RESEARCH_ENABLED=true und BING_SEARCH_API_KEY, um echte Websuche zu aktivieren.",
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
    cache: "no-store",
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
