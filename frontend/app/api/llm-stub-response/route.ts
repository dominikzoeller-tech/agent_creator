import { createControlledLlmStubResponse, listControlledLlmStubResponses, summarizeControlledLlmStubResponses } from "../../../lib/controlled-llm-stub-response-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const responses=listControlledLlmStubResponses(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeControlledLlmStubResponses(responses), responses }); }
  catch(error){ const message=error instanceof Error ? error.message : "LLM Stub Responses konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const response=createControlledLlmStubResponse({ envelopeId: typeof body.envelopeId==="string" ? body.envelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, response }); }
  catch(error){ const message=error instanceof Error ? error.message : "LLM Stub Response konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
