import { ExportFileEntry } from "../lib/types";

interface ExportsPanelProps {
  files: ExportFileEntry[];
  loading?: boolean;
  error?: string | null;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const itemStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: 14,
  display: "grid",
  gap: 8,
};

const linkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: 700,
  width: "fit-content",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ExportsPanel({ files, loading = false, error = null }: ExportsPanelProps) {
  if (loading) {
    return <section className="panel-card">Exports werden geladen…</section>;
  }

  if (error) {
    return (
      <section className="panel-card" style={{ borderColor: "#f87171", background: "#fef2f2", color: "#991b1b" }}>
        {error}
      </section>
    );
  }

  return (
    <section className="panel-card">
      <h2 style={{ marginTop: 0 }}>Export / Downloads</h2>
      <p className="helper-text" style={{ marginTop: 0 }}>
        Diese Liste zeigt vorhandene CSV- und Excel-Exporte aus dem <code>logs</code>-Ordner. Neue Dateien entstehen,
        wenn du z. B. <code>npm run stats:view</code> mit Exporten ausführst.
      </p>

      {files.length === 0 ? (
        <div style={{ color: "#64748b", lineHeight: 1.55 }}>
          Noch keine Exportdateien gefunden. Erzeuge zuerst CSV-/Excel-Exporte mit dem bestehenden Stats-Tool.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {files.map((file) => (
            <div key={file.name} style={itemStyle}>
              <div style={{ fontWeight: 700 }}>{file.name}</div>
              <div style={{ color: "#64748b" }}>
                Typ: {file.kind} · Größe: {formatBytes(file.size)} · Zuletzt geändert: {file.modifiedAt}
              </div>
              <a href={`/api/exports/download?name=${encodeURIComponent(file.name)}`} style={linkStyle}>
                Download starten
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
