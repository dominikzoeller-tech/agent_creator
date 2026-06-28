"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectMemoryType = "decision" | "milestone" | "issue" | "preference" | "system-state" | "note";

type ProjectMemoryEntry = {
  id: string;
  type: ProjectMemoryType;
  title: string;
  summary: string;
  tags: string[];
  source?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = { ok: true; entries: ProjectMemoryEntry[]; total: number } | { ok: false; error: string };
type SaveResponse = { ok: true; entry: ProjectMemoryEntry; mode: "created" | "updated" } | { ok: false; error: string };

const memoryTypes: ProjectMemoryType[] = ["decision", "milestone", "issue", "preference", "system-state", "note"];

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 14,
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid #0f172a",
  background: "#0f172a",
  color: "#ffffff",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
};

function emptyDraft(): Partial<ProjectMemoryEntry> {
  return {
    type: "note",
    title: "",
    summary: "",
    tags: [],
    source: "manual-ui",
  };
}

export default function MemoryAdminPage() {
  const [entries, setEntries] = useState<ProjectMemoryEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [draft, setDraft] = useState<Partial<ProjectMemoryEntry>>(emptyDraft());
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterTag, setFilterTag] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allTags = useMemo(() => Array.from(new Set(entries.flatMap((entry) => entry.tags))).sort(), [entries]);
  const selectedEntry = useMemo(() => entries.find((entry) => entry.id === selectedId), [entries, selectedId]);

  async function loadEntries() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (filterType) params.set("type", filterType);
      if (filterTag) params.set("tag", filterTag);

      const response = await fetch(`/api/memory?${params.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!data.ok) throw new Error(data.error);
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  function selectEntry(entry: ProjectMemoryEntry) {
    setSelectedId(entry.id);
    setDraft({ ...entry });
    setMessage(null);
    setError(null);
  }

  function newEntry() {
    setSelectedId("");
    setDraft(emptyDraft());
    setMessage("Neuer Memory-Eintrag vorbereitet.");
    setError(null);
  }

  async function saveEntry() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          type: draft.type ?? "note",
          title: draft.title ?? "",
          summary: draft.summary ?? "",
          tags: typeof draft.tags === "string" ? draft.tags : (draft.tags ?? []),
          source: draft.source ?? "manual-ui",
        }),
      });
      const data = (await response.json()) as SaveResponse;
      if (!data.ok) throw new Error(data.error);
      setSelectedId(data.entry.id);
      setDraft({ ...data.entry });
      setMessage(data.mode === "created" ? `Erstellt: ${data.entry.title}` : `Aktualisiert: ${data.entry.title}`);
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry() {
    if (!selectedId) return;
    const confirmed = window.confirm(`Memory-Eintrag wirklich löschen?\n\n${selectedId}`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/memory?id=${encodeURIComponent(selectedId)}`, { method: "DELETE" });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(`Gelöscht: ${selectedId}`);
      setSelectedId("");
      setDraft(emptyDraft());
      await loadEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Memory konnte nicht gelöscht werden.");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(field: keyof ProjectMemoryEntry, value: string) {
    if (field === "tags") {
      setDraft((current) => ({ ...current, tags: value.split(",").map((tag) => tag.trim()).filter(Boolean) }));
    } else {
      setDraft((current) => ({ ...current, [field]: value }));
    }
  }

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
        <a className="nav-link" href="/knowledge-quality">Knowledge Quality</a>
        <a className="nav-link" href="/memory">Memory</a>
        <a className="nav-link" href="/memory-quality">Memory Quality</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/logs">Logs</a>
        <a className="nav-link" href="/system">System</a>
      </nav>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
        <a className="nav-link" href="/knowledge-quality">Knowledge Quality</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/system">System</a>
      </nav>

      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Project Memory Admin</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Strukturierte Projektfakten aus <strong>memory/project-memory.json</strong> ansehen, erstellen, bearbeiten und löschen.
          Knowledge-Dateien bleiben Dokumente; Project Memory bleibt ein strukturiertes Projektgedächtnis. Memory Admin verwaltet strukturierte Projektentscheidungen, Meilensteine und Systemzustände.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}
      {message ? <section style={{ ...cardStyle, borderColor: "#bbf7d0", background: "#f0fdf4" }}>{message}</section> : null}

      <section style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Filter</h2>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <label>
            <div className="subtle-text">Suche</div>
            <input style={inputStyle} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Knowledge, Memory, Phase 7..." />
          </label>
          <label>
            <div className="subtle-text">Typ</div>
            <select style={inputStyle} value={filterType} onChange={(event) => setFilterType(event.target.value)}>
              <option value="">Alle Typen</option>
              {memoryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label>
            <div className="subtle-text">Tag</div>
            <select style={inputStyle} value={filterTag} onChange={(event) => setFilterTag(event.target.value)}>
              <option value="">Alle Tags</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </label>
          <button style={buttonStyle} onClick={loadEntries} disabled={loading}>{loading ? "Lädt..." : "Suchen"}</button>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 390px) 1fr", gap: 18, alignItems: "start" }}>
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Einträge</h2>
            <button style={secondaryButtonStyle} onClick={newEntry}>Neu</button>
          </div>

          {entries.length === 0 ? (
            <div className="helper-text">Keine Memory-Einträge gefunden.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => selectEntry(entry)}
                  style={{
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: selectedId === entry.id ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <strong>{entry.title}</strong>
                  <div className="subtle-text">{entry.type} · {new Date(entry.updatedAt).toLocaleString()}</div>
                  {entry.tags.length ? <div className="subtle-text">Tags: {entry.tags.join(", ")}</div> : null}
                </button>
              ))}
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Editor</h2>

          {selectedEntry ? <p className="helper-text">ID: {selectedEntry.id}</p> : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div className="subtle-text">Typ</div>
              <select style={inputStyle} value={draft.type ?? "note"} onChange={(event) => updateDraft("type", event.target.value)}>
                {memoryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label>
              <div className="subtle-text">Source</div>
              <input style={inputStyle} value={draft.source ?? ""} onChange={(event) => updateDraft("source", event.target.value)} placeholder="manual-ui" />
            </label>
          </div>

          <label style={{ display: "block", marginTop: 12 }}>
            <div className="subtle-text">Titel</div>
            <input style={inputStyle} value={draft.title ?? ""} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Kurzer Titel" />
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            <div className="subtle-text">Tags, kommagetrennt</div>
            <input style={inputStyle} value={(draft.tags ?? []).join(", ")} onChange={(event) => updateDraft("tags", event.target.value)} placeholder="phase8, memory, architecture" />
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            <div className="subtle-text">Summary</div>
            <textarea
              style={{ ...inputStyle, minHeight: 240, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              value={draft.summary ?? ""}
              onChange={(event) => updateDraft("summary", event.target.value)}
              placeholder="Was soll sich der Agent langfristig merken?"
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button style={buttonStyle} onClick={saveEntry} disabled={loading}>Speichern</button>
            <button style={secondaryButtonStyle} onClick={newEntry} disabled={loading}>Neu</button>
            <button style={{ ...secondaryButtonStyle, borderColor: "#fecaca", color: "#991b1b" }} onClick={deleteEntry} disabled={loading || !selectedId}>Löschen</button>
          </div>
        </section>
      </div>
    </main>
  );
}
