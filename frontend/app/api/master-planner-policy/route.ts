import { listMasterAgentPlannerPolicySimulations, simulateMasterAgentPlannerPolicy, summarizeMasterAgentPlannerPolicySimulations } from "../../../lib/master-agent-planner-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const simulations=listMasterAgentPlannerPolicySimulations(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeMasterAgentPlannerPolicySimulations(simulations), simulations });
  } catch(error){
    const message=error instanceof Error ? error.message : "Planner Policy Simulations konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const simulation=simulateMasterAgentPlannerPolicy({ recommendationId: typeof body.recommendationId==="string" ? body.recommendationId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, simulation });
  } catch(error){
    const message=error instanceof Error ? error.message : "Planner Policy Simulation konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
