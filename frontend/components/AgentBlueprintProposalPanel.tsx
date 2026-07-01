"use client";
type Props = { response: unknown };
function asRecord(value: unknown): Record<string, any> | null { return typeof value === "object" && value !== null ? value as Record<string, any> : null; }
export function AgentBlueprintProposalPanel({ response }: Props){
  const root=asRecord(response); const result=asRecord(root?.result); const proposal=asRecord(result?.agentBlueprintProposal);
  const id=result?.agentBlueprintProposalId || proposal?.id; const url=result?.agentBlueprintProposalUrl || proposal?.url; const agentName=result?.agentName || proposal?.agentName; const status=result?.status || proposal?.status; const risk=result?.riskLevel || proposal?.riskLevel;
  if(!id && !agentName) return null;
  return <section className="panel-card" style={{ borderColor:"#a78bfa", background:"#f5f3ff" }}>
    <h2 style={{ marginTop: 0 }}>Agent Blueprint Proposal</h2>
    <p style={{ margin:"8px 0", lineHeight:1.55 }}>Der Agent hat einen kontrollierten Blueprint-Vorschlag erstellt. Es wurde kein Agent automatisch aktiviert.</p>
    <ul style={{ margin:"8px 0 12px", paddingLeft:20 }}>
      {agentName ? <li><strong>Agent:</strong> {String(agentName)}</li> : null}
      {id ? <li><strong>Proposal ID:</strong> <code>{String(id)}</code></li> : null}
      {status ? <li><strong>Status:</strong> {String(status)}</li> : null}
      {risk ? <li><strong>Risk:</strong> {String(risk)}</li> : null}
    </ul>
    {url ? <a className="nav-link" href={String(url)}>Agent Blueprint öffnen</a> : null}
  </section>;
}
