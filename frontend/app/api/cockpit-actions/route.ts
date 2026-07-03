import { createCockpitActionPlan, listCockpitActionPlans, summarizeCockpitActionPlans, type CockpitActionType } from "../../../lib/cockpit-action-store";
export const dynamic = "force-dynamic";
const allowed = new Set(["review_capabilities", "prepare_agent_blueprint", "review_agent_registry", "prepare_runtime_dry_run", "prepare_tool_adapter_plan", "review_audit"]);
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const plans = listCockpitActionPlans(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeCockpitActionPlans(plans), plans });
  } catch(error){
    const message = error instanceof Error ? error.message : "Cockpit Action Plans konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const actionType = typeof body.actionType === "string" ? body.actionType : "";
    if(!allowed.has(actionType)) return Response.json({ ok:false, error:"Ungültiger actionType." }, { status:400 });
    const plan = createCockpitActionPlan({ actionType: actionType as CockpitActionType, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, plan });
  } catch(error){
    const message = error instanceof Error ? error.message : "Cockpit Action Plan konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
