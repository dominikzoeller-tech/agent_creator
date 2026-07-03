import { createToolExecutionSandboxPlan, listToolAdapters, listToolExecutionSandboxPlans, registerToolAdapter, summarizeToolAdapters, summarizeToolSandboxPlans, updateToolAdapterStatus } from "../../../lib/tool-adapter-registry-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const adapters = listToolAdapters();
    const plans = listToolExecutionSandboxPlans(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, adapterSummary: summarizeToolAdapters(adapters), planSummary: summarizeToolSandboxPlans(plans), adapters, plans });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Registry konnte nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    if(body.action === "plan") {
      const plan = createToolExecutionSandboxPlan({
        adapterId: typeof body.adapterId === "string" ? body.adapterId : undefined,
        adapterName: typeof body.adapterName === "string" ? body.adapterName : undefined,
        requestedAction: typeof body.requestedAction === "string" ? body.requestedAction : "dry-run-tool-plan",
        input: body.input && typeof body.input === "object" ? body.input : {},
        grantedPermissions: Array.isArray(body.grantedPermissions) ? body.grantedPermissions.filter((item: unknown): item is string => typeof item === "string") : [],
        metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
      });
      return Response.json({ ok:true, plan });
    }
    const adapter = registerToolAdapter({
      adapterName: typeof body.adapterName === "string" ? body.adapterName : "",
      displayName: typeof body.displayName === "string" ? body.displayName : undefined,
      purpose: typeof body.purpose === "string" ? body.purpose : "Controlled Tool Adapter im Dry-run-Modus.",
      allowedInputKeys: body.allowedInputKeys,
      allowedOutputKeys: body.allowedOutputKeys,
      requiredPermissions: body.requiredPermissions,
      riskLevel: body.riskLevel === "low" || body.riskLevel === "medium" || body.riskLevel === "high" ? body.riskLevel : undefined,
      requiresConsent: body.requiresConsent === false ? false : true,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, adapter });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Aktion fehlgeschlagen.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
export async function PATCH(request: Request){
  try{
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status === "draft" || body.status === "registered" || body.status === "disabled" || body.status === "test_mode" ? body.status : null;
    if(!id || !status) return Response.json({ ok:false, error:"id und status draft/registered/disabled/test_mode sind erforderlich." }, { status: 400 });
    const updated = updateToolAdapterStatus({ id, status });
    if(!updated) return Response.json({ ok:false, error:"Tool Adapter nicht gefunden." }, { status: 404 });
    return Response.json({ ok:true, adapter: updated });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Status konnte nicht geändert werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
