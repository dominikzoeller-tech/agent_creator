import { createRuntimeConsentBinding, listRuntimeConsentBindings, summarizeRuntimeConsentBindings, syncRuntimeConsentBindingStatuses } from "../../../lib/agent-runtime-consent-binding-store";
export const dynamic = "force-dynamic";
export async function GET(){
  try{
    const bindings = syncRuntimeConsentBindingStatuses();
    return Response.json({ ok:true, summary: summarizeRuntimeConsentBindings(bindings), bindings });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Consent Bindings konnten nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const binding = createRuntimeConsentBinding({ runtimeEnvelopeId: typeof body.runtimeEnvelopeId === "string" ? body.runtimeEnvelopeId : "", metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok:true, binding });
  } catch(error){
    const message = error instanceof Error ? error.message : "Runtime Consent Binding konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
