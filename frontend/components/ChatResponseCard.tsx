import { AskResponse } from "../lib/types";
import { ProcessingPathBadge } from "./ProcessingPathBadge";
import { RouteBadge } from "./RouteBadge";

interface ChatResponseCardProps {
  response: AskResponse | null;
  loading?: boolean;
  error?: string | null;
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  background: "#ffffff",
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.06)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: 0.4,
};

const sectionStyle: React.CSSProperties = {
  marginTop: 16,
};

const boxStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  padding: 14,
};

export function ChatResponseCard({ response, loading = false, error = null }: ChatResponseCardProps) {
  if (loading) {
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>Status</div>
        <div>Antwort wird geladen…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...cardStyle, borderColor: "#f87171", background: "#fef2f2" }}>
        <div style={labelStyle}>Fehler</div>
        <div style={{ color: "#991b1b", fontWeight: 600 }}>{error}</div>
      </div>
    );
  }

  if (!response) {
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>Antwort</div>
        <div>Noch keine Anfrage gesendet.</div>
      </div>
    );
  }

  if (!response.ok) {
    return (
      <div style={{ ...cardStyle, borderColor: "#f87171", background: "#fef2f2" }}>
        <div style={labelStyle}>API Fehler</div>
        <div style={{ color: "#991b1b", fontWeight: 600 }}>{response.error}</div>
      </div>
    );
  }

  if (response.mode === "local_policy") {
    return (
      <div style={cardStyle}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <RouteBadge route={response.routeSuggestion} />
          <ProcessingPathBadge processingPath={response.processingPath} />
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Antwort</div>
          <div style={boxStyle}>{response.answer}</div>
        </div>

        <div style={sectionStyle}>
          <div style={labelStyle}>Policy-Grund</div>
          <div style={boxStyle}>{response.reason}</div>
        </div>
      </div>
    );
  }

  const result = response.result;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <RouteBadge route={result.route} />
        <ProcessingPathBadge processingPath={response.processingPath} />
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Antwort</div>
        <div style={{ ...boxStyle, whiteSpace: "pre-wrap" }}>{result.answer}</div>
      </div>

      <div style={{ ...sectionStyle, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={labelStyle}>Empfehlung</div>
          <div style={boxStyle}>
            {typeof result.recommendation === "string" && result.recommendation.trim().length > 0
              ? result.recommendation
              : "-"}
          </div>
        </div>
        <div>
          <div style={labelStyle}>Erster Schritt</div>
          <div style={boxStyle}>
            {typeof result.firstStep === "string" && result.firstStep.trim().length > 0 ? result.firstStep : "-"}
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Metadaten</div>
        <div style={{ ...boxStyle, display: "grid", gap: 6 }}>
          <div>Mode: {response.mode}</div>
          <div>Processing Path: {response.processingPath}</div>
          <div>Redacted: {response.redacted ? "ja" : "nein"}</div>
          <div>Used Council: {result.usedCouncil ? "ja" : "nein"}</div>
          <div>Confidence: {typeof result.confidence === "number" ? `${Math.round(result.confidence * 100)}%` : "-"}</div>
        </div>
      </div>
    </div>
  );
}
