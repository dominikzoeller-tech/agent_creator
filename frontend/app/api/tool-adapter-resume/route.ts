import { createApprovedToolAdapterResumePlan, listApprovedToolAdapterResumePlans, summarizeApprovedToolAdapterResumePlans } from "../../../lib/approved-tool-adapter-resume-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const plans = listApprovedToolAdapterResumePlans(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeApprovedToolAdapterResumePlans(plans), plans });
  } catch(error){
    const message = error instanceof Error ? error.message : "Approved Tool Adapter Resume Plans konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const plan = createApprovedToolAdapterResumePlan({
      toolExecutionPlanId: typeof body.toolExecutionPlanId === "string" ? body.toolExecutionPlanId : undefined,
      consentBindingId: typeof body.consentBindingId === "string" ? body.consentBindingId : undefined,
      consentRequestId: typeof body.consentRequestId === "string" ? body.consentRequestId : undefined,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, plan });
  } catch(error){
    const message = error instanceof Error ? error.message : "Approved Tool Adapter Resume Plan konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
