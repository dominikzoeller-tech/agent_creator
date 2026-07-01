"use client";
type Props = { response: unknown };
function asRecord(value: unknown): Record<string, any> | null { return typeof value === "object" && value !== null ? value as Record<string, any> : null; }
export function MissingCapabilityRequestPanel({ response }: Props){
  const root = asRecord(response); const result = asRecord(root?.result); const request = asRecord(result?.capabilityRequest);
  const id = result?.capabilityRequestId || request?.id; const url = result?.capabilityUrl || request?.url; const capability = result?.requestedCapability || request?.requestedCapability; const status = result?.status || request?.status;
  if(!id && !capability) return null;
  return <section className="panel-card" style={{ borderColor: "#38bdf8", background: "#f0f9ff" }}>
    <h2 style={{ marginTop: 0 }}>Missing Tool / Capability Request</h2>
    <p style={{ margin: "8px 0", lineHeight: 1.55 }}>Der Agent hat keine passende bestehende Fähigkeit gefunden und deshalb nur einen kontrollierten Request erstellt. Es wurde kein Tool und kein Agent automatisch gebaut.</p>
    <ul style={{ margin: "8px 0 12px", paddingLeft: 20 }}>
      {capability ? <li><strong>Capability:</strong> {String(capability)}</li> : null}
      {id ? <li><strong>Request ID:</strong> <code>{String(id)}</code></li> : null}
      {status ? <li><strong>Status:</strong> {String(status)}</li> : null}
    </ul>
    {url ? <a className="nav-link" href={String(url)}>Capability Request öffnen</a> : null}
  </section>;
}
