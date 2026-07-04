import { createApprovalTokenIssuanceGate, listApprovalTokenIssuanceGates, summarizeApprovalTokenIssuanceGates } from "../../../lib/approval-token-issuance-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const approvalTokenIssuanceGates=listApprovalTokenIssuanceGates(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeApprovalTokenIssuanceGates(approvalTokenIssuanceGates), approvalTokenIssuanceGates }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Gates konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json().catch(()=>({})); const approvalTokenIssuanceGate=createApprovalTokenIssuanceGate({ approvalTokenRequestId: typeof body.approvalTokenRequestId==="string" ? body.approvalTokenRequestId : undefined, issuanceReason: typeof body.issuanceReason==="string" ? body.issuanceReason : undefined, issuanceIntent: body.issuanceIntent === true, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, approvalTokenIssuanceGate }); }
  catch(error){ const message=error instanceof Error ? error.message : "Approval Token Issuance Gate konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
