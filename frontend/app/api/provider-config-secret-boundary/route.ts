import { createProviderConfigSecretBoundaryCheck, listProviderConfigSecretBoundaryChecks, summarizeProviderConfigSecretBoundaryChecks } from "../../../lib/provider-config-secret-boundary-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url=new URL(request.url);
    const limit=Number(url.searchParams.get("limit")||"100");
    const boundaryChecks=listProviderConfigSecretBoundaryChecks(Number.isFinite(limit)?limit:100);
    return Response.json({ ok:true, summary:summarizeProviderConfigSecretBoundaryChecks(boundaryChecks), boundaryChecks });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Config Boundary Checks konnten nicht gelesen werden.";
    return Response.json({ ok:false, error:message }, { status:500 });
  }
}
export async function POST(request: Request){
  try{
    const body=await request.json().catch(()=>({}));
    const boundaryCheck=createProviderConfigSecretBoundaryCheck({ metadata: body.metadata && typeof body.metadata==="object" ? body.metadata : undefined });
    return Response.json({ ok:true, boundaryCheck });
  } catch(error){
    const message=error instanceof Error ? error.message : "Provider Config Boundary Check konnte nicht erstellt werden.";
    return Response.json({ ok:false, error:message }, { status:400 });
  }
}
