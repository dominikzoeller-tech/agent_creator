import { createControlledRealProviderInvocationGate, listControlledRealProviderInvocationGates, summarizeControlledRealProviderInvocationGates } from "../../../lib/controlled-real-provider-invocation-gate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const gates=listControlledRealProviderInvocationGates(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeControlledRealProviderInvocationGates(gates), gates }); }
  catch(error){ const message=error instanceof Error ? error.message : "Real Provider Invocation Gates konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json().catch(()=>({})); const gate=createControlledRealProviderInvocationGate({ simulationEnvelopeId: typeof body.simulationEnvelopeId==="string" ? body.simulationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, gate }); }
  catch(error){ const message=error instanceof Error ? error.message : "Real Provider Invocation Gate konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
