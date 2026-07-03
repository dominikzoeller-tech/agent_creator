import { createToolAdapterConsentBinding, summarizeToolAdapterConsentBindings, syncToolAdapterConsentBindingStatuses } from "../../../lib/tool-adapter-consent-binding-store";
export const dynamic = "force-dynamic";
export async function GET(){
  try{
    const bindings=syncToolAdapterConsentBindingStatuses();
    return Response.json({ ok:true, summary:summarizeToolAdapterConsentBindings(bindings), bindings });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Consent Bindings konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const binding=createToolAdapterConsentBinding({ toolExecutionPlanId: typeof body.toolExecutionPlanId === "string" ? body.toolExecutionPlanId : "", metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, binding });
  } catch(error){
    const message = error instanceof Error ? error.message : "Tool Adapter Consent Binding konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
