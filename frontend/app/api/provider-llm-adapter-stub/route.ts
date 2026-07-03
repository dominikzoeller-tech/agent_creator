import { createProviderAgnosticLlmInvocationAdapterStub, listProviderAgnosticLlmInvocationAdapterStubs, summarizeProviderAgnosticLlmInvocationAdapterStubs } from "../../../lib/provider-agnostic-llm-invocation-adapter-stub-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const adapterStubs=listProviderAgnosticLlmInvocationAdapterStubs(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderAgnosticLlmInvocationAdapterStubs(adapterStubs), adapterStubs });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Adapter Stubs konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json();
    const adapterStub=createProviderAgnosticLlmInvocationAdapterStub({ invocationEnvelopeId: typeof body.invocationEnvelopeId==="string" ? body.invocationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, adapterStub });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Adapter Stub konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
