import { AskResponse, WebResearchResult, WebResearchSource } from "../lib/types";

interface WebResearchPanelProps {
  response: AskResponse | null;
}

interface ExtractedWebResearchMetadata {
  usedWebResearch?: boolean;
  webResearchEnabled?: boolean;
  webResearchQuery?: string;
  webResearchMessage?: string;
  webResearchResults?: WebResearchResult[];
  usedWebResearchSummary?: boolean;
  webResearchSummary?: string;
  webResearchSummaryMessage?: string;
  webResearchSources?: WebResearchSource[];
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const boxStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "#f8fafc",
  padding: 14,
};

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 700,
  color: "#334155",
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractWebResearchMetadata(response: AskResponse | null): ExtractedWebResearchMetadata | null {
  if (!response || response.ok === false || response.mode !== "cloud") return null;

  const result = response.result as unknown;
  if (!isObject(result)) return null;

  const metadata: ExtractedWebResearchMetadata = {
    usedWebResearch: typeof result.usedWebResearch === "boolean" ? result.usedWebResearch : undefined,
    webResearchEnabled: typeof result.webResearchEnabled === "boolean" ? result.webResearchEnabled : undefined,
    webResearchQuery: typeof result.webResearchQuery === "string" ? result.webResearchQuery : undefined,
    webResearchMessage: typeof result.webResearchMessage === "string" ? result.webResearchMessage : undefined,
    webResearchResults: Array.isArray(result.webResearchResults)
      ? (result.webResearchResults.filter(isObject) as unknown as WebResearchResult[])
      : undefined,
    usedWebResearchSummary: typeof result.usedWebResearchSummary === "boolean" ? result.usedWebResearchSummary : undefined,
    webResearchSummary: typeof result.webResearchSummary === "string" ? result.webResearchSummary : undefined,
    webResearchSummaryMessage: typeof result.webResearchSummaryMessage === "string" ? result.webResearchSummaryMessage : undefined,
    webResearchSources: Array.isArray(result.webResearchSources)
      ? (result.webResearchSources.filter(isObject) as unknown as WebResearchSource[])
      : undefined,
  };

  const hasAnyValue = Object.values(metadata).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== "";
  });

  return hasAnyValue ? metadata : null;
}

function prettyBoolean(value: boolean | undefined): string {
  if (value === true) return "ja";
  if (value === false) return "nein";
  return "unbekannt";
}

export function WebResearchPanel({ response }: WebResearchPanelProps) {
  const metadata = extractWebResearchMetadata(response);

  if (!metadata) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Web Research</h2>
        <div className="helper-text">
          Noch keine Web-Research-Metadaten in der API-Antwort sichtbar. Sobald Phase 9.1 aktiv ist,
          erscheinen hier Web-Research-Status, Treffer, AI Summary und Quellen.
        </div>
      </section>
    );
  }

  const results = metadata.webResearchResults ?? [];
  const sources = metadata.webResearchSources ?? [];

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Web Research</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Zeigt, ob Web Research benutzt wurde, welche Ergebnisse gefunden wurden und ob eine KI-Zusammenfassung erstellt wurde.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={boxStyle}>
          <div className="subtle-text">Web Research aktiviert</div>
          <strong>{prettyBoolean(metadata.webResearchEnabled)}</strong>
        </div>
        <div style={boxStyle}>
          <div className="subtle-text">Web Research genutzt</div>
          <strong>{prettyBoolean(metadata.usedWebResearch)}</strong>
        </div>
        <div style={boxStyle}>
          <div className="subtle-text">AI Summary genutzt</div>
          <strong>{prettyBoolean(metadata.usedWebResearchSummary)}</strong>
        </div>
      </div>

      {metadata.webResearchQuery ? (
        <div style={{ ...boxStyle, marginBottom: 14 }}>
          <strong>Query:</strong> {metadata.webResearchQuery}
        </div>
      ) : null}

      {metadata.webResearchMessage ? (
        <div style={{ ...boxStyle, marginBottom: 14 }}>
          <strong>Status:</strong> {metadata.webResearchMessage}
        </div>
      ) : null}

      {metadata.webResearchSummaryMessage ? (
        <div style={{ ...boxStyle, marginBottom: 14 }}>
          <strong>Summary Status:</strong> {metadata.webResearchSummaryMessage}
        </div>
      ) : null}

      {metadata.webResearchSummary ? (
        <div style={{ ...boxStyle, marginBottom: 14, background: "#eff6ff" }}>
          <h3 style={{ marginTop: 0 }}>AI Research Summary</h3>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{metadata.webResearchSummary}</div>
        </div>
      ) : null}

      <h3>Web Research Treffer</h3>
      {results.length === 0 ? (
        <div className="helper-text">Keine Web-Research-Treffer für diese Anfrage.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {results.map((result) => (
            <article key={result.url} style={boxStyle}>
              <a href={result.url} target="_blank" rel="noreferrer" style={{ fontWeight: 800 }}>
                {result.title}
              </a>
              <div className="subtle-text">{result.source ?? result.url}</div>
              <p style={{ marginBottom: 0 }}>{result.snippet}</p>
            </article>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: 18 }}>Quellen</h3>
      {sources.length === 0 ? (
        <div className="helper-text">Keine Quellenliste vorhanden.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sources.map((source, index) => (
            <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" style={chipStyle}>
              Quelle {index + 1}: {source.title}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
