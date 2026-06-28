import { AskResponse, ProjectMemoryEntry } from "../lib/types";

interface MemoryHitsPanelProps {
  response: AskResponse | null;
}

interface ExtractedMemoryMetadata {
  usedMemory?: boolean;
  memorySummary?: string;
  memoryHits?: ProjectMemoryEntry[];
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

function extractMemoryMetadata(response: AskResponse | null): ExtractedMemoryMetadata | null {
  if (!response || response.ok === false || response.mode !== "cloud") return null;

  const result = response.result as unknown;
  if (!isObject(result)) return null;

  const usedMemory = typeof result.usedMemory === "boolean" ? result.usedMemory : undefined;
  const memorySummary = typeof result.memorySummary === "string" ? result.memorySummary : undefined;
  const memoryHits = Array.isArray(result.memoryHits)
    ? (result.memoryHits.filter(isObject) as unknown as ProjectMemoryEntry[])
    : undefined;

  if (usedMemory === undefined && !memorySummary && !memoryHits) return null;

  return { usedMemory, memorySummary, memoryHits };
}

export function MemoryHitsPanel({ response }: MemoryHitsPanelProps) {
  const metadata = extractMemoryMetadata(response);

  if (!metadata) {
    return (
      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Project Memory Treffer</h2>
        <div className="helper-text">
          Noch keine Memory-Metadaten in der API-Antwort sichtbar. Sobald Phase 8.2 aktiv ist und eine passende Anfrage gestellt wird,
          erscheinen hier Treffer aus <strong>memory/project-memory.json</strong>.
        </div>
      </section>
    );
  }

  const hits = metadata.memoryHits ?? [];

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Project Memory Treffer</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Zeigt, welche strukturierten Project-Memory-Einträge der Agent als zusätzlichen Kontext genutzt hat.
      </p>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: metadata.usedMemory ? "#eff6ff" : "#f8fafc", marginBottom: 14 }}>
        <strong>Used Memory:</strong> {metadata.usedMemory ? "ja" : "nein"}
        {metadata.memorySummary ? (
          <div style={{ marginTop: 8 }}>
            <strong>Summary:</strong> {metadata.memorySummary}
          </div>
        ) : null}
      </div>

      {hits.length === 0 ? (
        <div className="helper-text">Keine Project-Memory-Treffer für diese Anfrage.</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {hits.map((hit) => (
            <article key={hit.id} style={hitStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{hit.title}</h3>
                <span style={chipStyle}>{hit.type}</span>
              </div>

              <p style={{ marginBottom: 0 }}>{hit.summary}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {hit.tags?.map((tag) => <span key={tag} style={chipStyle}>{tag}</span>)}
              </div>

              <div className="subtle-text" style={{ marginTop: 10 }}>
                ID: {hit.id}
                {hit.source ? ` · Source: ${hit.source}` : ""}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
