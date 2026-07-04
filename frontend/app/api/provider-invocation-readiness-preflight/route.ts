import { createProviderInvocationReadinessPreflight, listProviderInvocationReadinessPreflights, summarizeProviderInvocationReadinessPreflights } from "../../../lib/provider-invocation-readiness-preflight-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const preflights=listProviderInvocationReadinessPreflights(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderInvocationReadinessPreflights(preflights), preflights });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Invocation Readiness Preflights konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json().catch(()=>({}));
    const preflight=createProviderInvocationReadinessPreflight({ boundaryCheckId: typeof body.boundaryCheckId==="string" ? body.boundaryCheckId : undefined, adapterStubId: typeof body.adapterStubId==="string" ? body.adapterStubId : undefined, metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, preflight });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Invocation Readiness Preflight konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
