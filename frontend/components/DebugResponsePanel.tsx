import { AskResponse } from "../lib/types";

interface DebugResponsePanelProps {
  response: AskResponse | null;
  visible: boolean;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.04)",
};

const codeStyle: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#0f172a",
  color: "#e2e8f0",
  padding: 14,
  overflowX: "auto",
  fontFamily: "Consolas, Monaco, monospace",
  fontSize: 13,
  lineHeight: 1.5,
};

export function DebugResponsePanel({ response, visible }: DebugResponsePanelProps) {
  if (!visible) return null;

  return (
    <section style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Admin / Debug JSON</h2>
      <div style={codeStyle}>
        <pre style={{ margin: 0 }}>{JSON.stringify(response, null, 2)}</pre>
      </div>
    </section>
  );
}
