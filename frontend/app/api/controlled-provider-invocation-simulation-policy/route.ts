import { listControlledProviderSimulationPolicySimulations, simulateControlledProviderSimulationPolicy, summarizeControlledProviderSimulationPolicySimulations } from "../../../lib/controlled-provider-invocation-simulation-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{ const url=new URL(request.url); const limit=Number(url.searchParams.get("limit")||"100"); const simulations=listControlledProviderSimulationPolicySimulations(Number.isFinite(limit)?limit:100); return Response.json({ ok:true, summary:summarizeControlledProviderSimulationPolicySimulations(simulations), simulations }); }
  catch(error){ const message=error instanceof Error ? error.message : "Provider Simulation Policy Simulations konnten nicht gelesen werden."; return Response.json({ ok:false, error:message }, { status:500 }); }
}
export async function POST(request: Request){
  try{ const body=await request.json(); const simulation=simulateControlledProviderSimulationPolicy({ simulationEnvelopeId: typeof body.simulationEnvelopeId==="string" ? body.simulationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined }); return Response.json({ ok:true, simulation }); }
  catch(error){ const message=error instanceof Error ? error.message : "Provider Simulation Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok:false, error:message }, { status:400 }); }
}
