import { listToolAdapterPolicySimulations, simulateToolAdapterPolicy, summarizeToolAdapterPolicySimulations } from "../../../lib/tool-adapter-policy-simulation-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const simulations = listToolAdapterPolicySimulations(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeToolAdapterPolicySimulations(simulations), simulations });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const simulation = simulateToolAdapterPolicy({ resumePlanId: typeof body.resumePlanId === "string" ? body.resumePlanId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
