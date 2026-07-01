import { readGovernanceAuditEvents, summarizeGovernanceAudit } from "../../../lib/governance-audit-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "250");
    const events = readGovernanceAuditEvents(Number.isFinite(limit) ? limit : 250);
    return Response.json({ ok:true, summary: summarizeGovernanceAudit(events), events });
  } catch(error){
    const message = error instanceof Error ? error.message : "Governance Audit Trail konnte nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
