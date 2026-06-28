import { WebResearchResult } from "./web-research";

export interface WebResearchSource {
  title: string;
  url: string;
  source?: string;
}

export interface WebResearchSummaryInput {
  query: string;
  results: WebResearchResult[];
}

export interface WebResearchSummaryResult {
  used: boolean;
  summary?: string;
  sources: WebResearchSource[];
  message?: string;
}

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

export async function summarizeWebResearchResults(
  input: WebResearchSummaryInput
): Promise<WebResearchSummaryResult> {
  const sources = input.results.map((result) => ({
    title: result.title,
    url: result.url,
    source: result.source,
  }));

  if (input.results.length === 0) {
    return {
      used: false,
      sources,
      message: "Keine Web-Research-Ergebnisse für eine KI-Zusammenfassung vorhanden.",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      used: false,
      sources,
      message: "OPENAI_API_KEY fehlt. Web-Ergebnisse wurden gefunden, aber nicht per KI zusammengefasst.",
    };
  }

  const model = process.env.WEB_RESEARCH_SUMMARY_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const prompt = buildSummaryPrompt(input.query, input.results);

  const response = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "Du bist ein vorsichtiger Research-Assistent. Fasse ausschließlich die bereitgestellten Suchergebnis-Snippets zusammen. Erfinde keine Fakten. Wenn Snippets nicht ausreichen, sage das klar. Antworte auf Deutsch.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    return {
      used: false,
      sources,
      message: `OpenAI Web-Research-Summary fehlgeschlagen: HTTP ${response.status}`,
    };
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const summary = data.choices?.[0]?.message?.content?.trim();
  if (!summary) {
    return {
      used: false,
      sources,
      message: "OpenAI hat keine Web-Research-Summary zurückgegeben.",
    };
  }

  return {
    used: true,
    summary,
    sources,
  };
}

function buildSummaryPrompt(query: string, results: WebResearchResult[]): string {
  const resultLines = results
    .slice(0, 8)
    .map((result, index) => {
      return [
        `Quelle ${index + 1}`,
        `Titel: ${result.title}`,
        `URL: ${result.url}`,
        `Quelle/Display: ${result.source ?? "unbekannt"}`,
        `Snippet: ${result.snippet}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `Research-Frage: ${query}`,
    "",
    "Suchergebnisse:",
    resultLines,
    "",
    "Aufgabe:",
    "1. Erstelle eine kurze, quellengebundene Zusammenfassung in 4 bis 6 Bulletpoints.",
    "2. Nenne, falls relevant, Unsicherheiten oder fehlende Informationen.",
    "3. Verwende keine Informationen außerhalb der Snippets.",
    "4. Füge am Ende eine kurze Quellenliste mit Quelle 1, Quelle 2 usw. hinzu.",
  ].join("\n");
}
