import { AskResponse, KnowledgeSearchResult } from "../lib/types";

interface KnowledgeHitsPanelProps {
  response: AskResponse | null;
}

interface ExtractedKnowledgeMetadata {
  usedKnowledge?: boolean;
  knowledgeSummary?: string;
  knowledgeHits?: KnowledgeSearchResult[];
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const hitStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "#f8fafc",
  padding: 14,
  lineHeight: 1.55,
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

function extractKnowledgeMetadata(response: AskResponse | null): ExtractedKnowledgeMetadata | null {
  if (!response || response.ok === false || response.mode !== "cloud") return null;

  const result = response.result as unknown;
  if (!isObject(result)) return null;

  const usedKnowledge = typeof result.usedKnowledge === "boolean" ? result.usedKnowledge : undefined;
  const knowledgeSummary = typeof result.knowledgeSummary === "string" ? result.knowledgeSummary : undefined;
  const knowledgeHits = Array.isArray(result.knowledgeHits)
    ? (result.knowledgeHits.filter(isObject) as unknown as KnowledgeSearchResult[])
    : undefined;

  if (usedKnowledge === undefined && !knowledgeSummary && !knowledgeHits) return null;

  return { usedKnowledge, knowledgeSummary, knowledgeHits };
}

export function KnowledgeHitsPanel({ response }: KnowledgeHitsPanelProps) {
  const metadata = extractKnowledgeMetadata(response);

  if (!metadata) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Lokale Knowledge-Treffer</h2>
        <div className="helper-text">
          Noch keine Knowledge-Metadaten in der API-Antwort sichtbar. Sobald Phase 7.4 aktiv ist und eine passende Anfrage gestellt wird,
          erscheinen hier lokale Treffer aus dem Ordner <strong>knowledge/</strong>.
        </div>
      </section>
    );
  }

  const hits = metadata.knowledgeHits ?? [];

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Lokale Knowledge-Treffer</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Zeigt, welche lokalen Wissensdateien der Agent als zusätzlichen Kontext genutzt hat.
      </p>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: metadata.usedKnowledge ? "#ecfdf5" : "#f8fafc", marginBottom: 14 }}>
        <strong>Used Knowledge:</strong> {metadata.usedKnowledge ? "ja" : "nein"}
        {metadata.knowledgeSummary ? (
          <div style={{ marginTop: 8 }}>
            <strong>Summary:</strong> {metadata.knowledgeSummary}
          </div>
        ) : null}
      </div>

      {hits.length === 0 ? (
        <div className="helper-text">Keine Knowledge-Hits für diese Anfrage.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {hits.map((hit) => (
            <article key={`${hit.id}-${hit.score}`} style={hitStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{hit.title}</h3>
                <span style={chipStyle}>Score: {hit.score}</span>
              </div>
              <div className="subtle-text" style={{ marginTop: 6 }}>{hit.sourcePath}</div>
              {hit.tags?.length ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {hit.tags.map((tag) => <span key={tag} style={chipStyle}>{tag}</span>)}
                </div>
              ) : null}
              <p style={{ marginBottom: 0 }}>{hit.snippet}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
