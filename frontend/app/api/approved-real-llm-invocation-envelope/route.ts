import { createApprovedRealLlmInvocationEnvelope, listApprovedRealLlmInvocationEnvelopes, summarizeApprovedRealLlmInvocationEnvelopes } from "../../../lib/approved-real-llm-invocation-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const invocationEnvelopes=listApprovedRealLlmInvocationEnvelopes(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeApprovedRealLlmInvocationEnvelopes(invocationEnvelopes), invocationEnvelopes });
  } catch(error){
    const message=error instanceof Error ? error.message : "Approved Invocation Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const invocationEnvelope=createApprovedRealLlmInvocationEnvelope({ consentRequestId: typeof body.consentRequestId==="string" ? body.consentRequestId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, invocationEnvelope });
  } catch(error){
    const message=error instanceof Error ? error.message : "Approved Invocation Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
