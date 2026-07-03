import { createRealLlmInvocationConsentRequest, listRealLlmInvocationConsentRequests, summarizeRealLlmInvocationConsentRequests } from "../../../lib/real-llm-invocation-consent-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const consentRequests=listRealLlmInvocationConsentRequests(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeRealLlmInvocationConsentRequests(consentRequests), consentRequests });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Consent Requests konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const consentRequest=createRealLlmInvocationConsentRequest({ gateId: typeof body.gateId==="string" ? body.gateId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, consentRequest });
  } catch(error){
    const message=error instanceof Error ? error.message : "Real LLM Consent Request konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
