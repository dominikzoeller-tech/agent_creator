import { createControlledRealLlmCallGate, listControlledRealLlmCallGates, summarizeControlledRealLlmCallGates } from "../../../lib/controlled-real-llm-call-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const gates=listControlledRealLlmCallGates(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledRealLlmCallGates(gates), gates });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Call Gates konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const gate=createControlledRealLlmCallGate({ responseId: typeof body.responseId==="string" ? body.responseId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, gate });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Call Gate konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
