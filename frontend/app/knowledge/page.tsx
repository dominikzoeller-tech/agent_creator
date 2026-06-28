"use client";

import { useEffect, useMemo, useState } from "react";

type KnowledgeFileSummary = {
  fileName: string;
  title: string;
  tags: string[];
  size: number;
  updatedAt: string;
};

type KnowledgeFileDetail = KnowledgeFileSummary & {
  content: string;
};

type ListResponse = { ok: true; files: KnowledgeFileSummary[] } | { ok: false; error: string };
type DetailResponse = ({ ok: true } & KnowledgeFileDetail) | { ok: false; error: string };

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

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  return `${Math.round((size / 1024) * 10) / 10} KB`;
}

function defaultContent(title: string, tags: string): string {
  return `# ${title || "Neue Knowledge-Datei"}\n\nTags: ${tags || "knowledge"}\n\nNotizen hier ergänzen.\n`;
}

export default function KnowledgeAdminPage() {
  const [files, setFiles] = useState<KnowledgeFileSummary[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [fileName, setFileName] = useState("new-knowledge-note.md");
  const [title, setTitle] = useState("Neue Knowledge-Datei");
  const [tags, setTags] = useState("knowledge");
  const [content, setContent] = useState(defaultContent("Neue Knowledge-Datei", "knowledge"));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedSummary = useMemo(
    () => files.find((file) => file.fileName === selectedFile),
    [files, selectedFile]
  );

  async function loadFiles() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/knowledge", { cache: "no-store" });
      const data = (await response.json()) as ListResponse;
      if (!data.ok) throw new Error(data.error);
      setFiles(data.files);
      if (!selectedFile && data.files.length > 0) setSelectedFile(data.files[0].fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge-Dateien konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function loadFile(file: string) {
    if (!file) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/knowledge?file=${encodeURIComponent(file)}`, { cache: "no-store" });
      const data = (await response.json()) as DetailResponse;
      if (!data.ok) throw new Error(data.error);
      setSelectedFile(data.fileName);
      setFileName(data.fileName);
      setTitle(data.title);
      setTags(data.tags.join(", "));
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge-Datei konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function saveFile() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          title,
          tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
          content,
        }),
      });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(`Gespeichert: ${data.fileName}`);
      await loadFiles();
      setSelectedFile(data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge-Datei konnte nicht gespeichert werden.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteFile() {
    if (!selectedFile) return;
    const confirmed = window.confirm(`Knowledge-Datei wirklich löschen?\n\n${selectedFile}`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/knowledge?file=${encodeURIComponent(selectedFile)}`, { method: "DELETE" });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setMessage(`Gelöscht: ${selectedFile}`);
      setSelectedFile("");
      setFileName("new-knowledge-note.md");
      setTitle("Neue Knowledge-Datei");
      setTags("knowledge");
      setContent(defaultContent("Neue Knowledge-Datei", "knowledge"));
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Knowledge-Datei konnte nicht gelöscht werden.");
    } finally {
      setLoading(false);
    }
  }

  function newFile() {
    setSelectedFile("");
    setFileName("new-knowledge-note.md");
    setTitle("Neue Knowledge-Datei");
    setTags("knowledge");
    setContent(defaultContent("Neue Knowledge-Datei", "knowledge"));
    setMessage("Neue Datei vorbereitet.");
    setError(null);
  }

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedFile) loadFile(selectedFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: 24, display: "grid", gap: 18 }}>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <a className="nav-link" href="/">Chat</a>
        <a className="nav-link" href="/logs">Logs</a>
        <a className="nav-link" href="/analytics">Analytics</a>
        <a className="nav-link" href="/system">System</a>
        <a className="nav-link" href="/knowledge">Knowledge</a>
      </nav>
      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>Knowledge Admin</h1>
        <p className="helper-text" style={{ marginBottom: 0 }}>
          Lokale Knowledge-Dateien aus dem Ordner <strong>knowledge/</strong> ansehen, bearbeiten und hinzufügen.
          Unterstützt werden <strong>.md</strong> und <strong>.txt</strong> Dateien. Änderungen werden lokal im knowledge-Ordner gespeichert.
        </p>
      </section>

      {error ? <section style={{ ...cardStyle, borderColor: "#fecaca", background: "#fef2f2" }}>{error}</section> : null}
      {message ? <section style={{ ...cardStyle, borderColor: "#bbf7d0", background: "#f0fdf4" }}>{message}</section> : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 360px) 1fr", gap: 18, alignItems: "start" }}>
        <section style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Dateien</h2>
            <button style={secondaryButtonStyle} onClick={loadFiles} disabled={loading}>Neu laden</button>
          </div>

          <button style={{ ...buttonStyle, width: "100%", marginBottom: 12 }} onClick={newFile} disabled={loading}>
            Neue Datei
          </button>

          {files.length === 0 ? (
            <div className="helper-text">Noch keine Knowledge-Dateien vorhanden.</div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {files.map((file) => (
                <button
                  key={file.fileName}
                  type="button"
                  onClick={() => setSelectedFile(file.fileName)}
                  style={{
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: selectedFile === file.fileName ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <strong>{file.title}</strong>
                  <div className="subtle-text">{file.fileName} · {formatSize(file.size)}</div>
                  {file.tags.length ? <div className="subtle-text">Tags: {file.tags.join(", ")}</div> : null}
                </button>
              ))}
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Editor</h2>

          {selectedSummary ? (
            <p className="helper-text">
              Zuletzt geändert: {new Date(selectedSummary.updatedAt).toLocaleString()}
            </p>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>
              <div className="subtle-text">Dateiname</div>
              <input style={inputStyle} value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="example.md" />
            </label>
            <label>
              <div className="subtle-text">Titel</div>
              <input style={inputStyle} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titel" />
            </label>
          </div>

          <label style={{ display: "block", marginTop: 12 }}>
            <div className="subtle-text">Tags, kommagetrennt</div>
            <input style={inputStyle} value={tags} onChange={(event) => setTags(event.target.value)} placeholder="agents, routing" />
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            <div className="subtle-text">Inhalt</div>
            <textarea
              style={{ ...inputStyle, minHeight: 380, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button style={buttonStyle} onClick={saveFile} disabled={loading}>Speichern</button>
            <button style={secondaryButtonStyle} onClick={() => selectedFile && loadFile(selectedFile)} disabled={loading || !selectedFile}>Zurücksetzen</button>
            <button style={{ ...secondaryButtonStyle, borderColor: "#fecaca", color: "#991b1b" }} onClick={deleteFile} disabled={loading || !selectedFile}>Löschen</button>
          </div>
        </section>
      </div>
    </main>
  );
}
