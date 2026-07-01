"use client";

type Props = { response: unknown };

function asRecord(value: unknown): Record<string, any> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, any>) : null;
}

export function AgentFlowConsentRequestPanel({ response }: Props) {
  const root = asRecord(response);
  const result = asRecord(root?.result);
  const consent = asRecord(result?.toolConsent);
  const requestId = result?.consentRequestId || consent?.requestId;
  const consentUrl = result?.consentUrl || consent?.url;
  const toolId = result?.toolId || consent?.toolId;
  const status = result?.status || consent?.status;
  const required = result?.consentRequired === true || consent?.required === true;

  if (!required && !requestId) return null;

  return (
    <section className="panel-card" style={{ borderColor: "#f59e0b", background: "#fffbeb" }}>
      <h2 style={{ marginTop: 0 }}>Consent Request im Agent Flow</h2>
      <p style={{ margin: "8px 0", lineHeight: 1.55 }}>
        Die Tool-Ausführung wurde angehalten, bis dieser Consent Request entschieden wurde.
      </p>
      <ul style={{ margin: "8px 0 12px", paddingLeft: 20 }}>
        {toolId ? <li><strong>Tool:</strong> {String(toolId)}</li> : null}
        {requestId ? <li><strong>Request ID:</strong> <code>{String(requestId)}</code></li> : null}
        {status ? <li><strong>Status:</strong> {String(status)}</li> : null}
      </ul>
      {consentUrl ? (
        <a className="nav-link" href={String(consentUrl)}>Consent Request öffnen</a>
      ) : null}
      <p className="helper-text" style={{ marginTop: 10 }}>
        Phase 11.3 Resume: Nach Genehmigung kann derselbe Agent Request mit dieser Consent Request ID erneut gesendet werden.
      </p>
    </section>
  );
}
