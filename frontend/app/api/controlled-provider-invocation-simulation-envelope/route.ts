import { createControlledProviderInvocationSimulationEnvelope, listControlledProviderInvocationSimulationEnvelopes, summarizeControlledProviderInvocationSimulationEnvelopes } from "../../../lib/controlled-provider-invocation-simulation-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulationEnvelopes=listControlledProviderInvocationSimulationEnvelopes(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeControlledProviderInvocationSimulationEnvelopes(simulationEnvelopes), simulationEnvelopes });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Simulation Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json().catch(()=>({}));
    const simulationEnvelope=createControlledProviderInvocationSimulationEnvelope({ preflightId: typeof body.preflightId==="string" ? body.preflightId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulationEnvelope });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Simulation Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
