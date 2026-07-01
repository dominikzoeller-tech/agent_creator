import { listRuntimePolicySimulations, simulateRuntimePolicy, summarizeRuntimePolicySimulations } from "../../../lib/agent-runtime-policy-simulation-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const simulations = listRuntimePolicySimulations(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeRuntimePolicySimulations(simulations), simulations });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const simulation = simulateRuntimePolicy({ resumeEnvelopeId: typeof body.resumeEnvelopeId === "string" ? body.resumeEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
