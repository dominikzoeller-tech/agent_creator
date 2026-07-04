import { createHumanApprovalTokenRequest, listHumanApprovalTokenRequests, summarizeHumanApprovalTokenRequests } from "../../../lib/human-approval-token-request-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const approvalTokenRequests=listHumanApprovalTokenRequests(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeHumanApprovalTokenRequests(approvalTokenRequests), approvalTokenRequests }); }
  catch(error){ const message=error instanceof Error ? error.message : "Human Approval Token Requests konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json().catch(()=>({})); const approvalTokenRequest=createHumanApprovalTokenRequest({ gateId: typeof body.gateId==="string" ? body.gateId : undefined, approvalReason: typeof body.approvalReason==="string" ? body.approvalReason : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, approvalTokenRequest }); }
  catch(error){ const message=error instanceof Error ? error.message : "Human Approval Token Request konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
