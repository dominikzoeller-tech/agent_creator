import { listApprovalTokenIssuancePolicySimulations, simulateApprovalTokenIssuancePolicy, summarizeApprovalTokenIssuancePolicySimulations } from "../../../lib/approval-token-issuance-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listApprovalTokenIssuancePolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeApprovalTokenIssuancePolicySimulations(simulations), simulations }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const simulation=simulateApprovalTokenIssuancePolicy({ issuanceGateId: typeof body.issuanceGateId==="string" ? body.issuanceGateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
