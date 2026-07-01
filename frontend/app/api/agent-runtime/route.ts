import { createControlledAgentRuntimeEnvelope, listControlledAgentRuntimeEnvelopes, summarizeControlledAgentRuntime } from "../../../lib/controlled-agent-runtime-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request){
  try{
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const envelopes = listControlledAgentRuntimeEnvelopes(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok:true, summary: summarizeControlledAgentRuntime(envelopes), envelopes });
  } catch(error){
    const message = error instanceof Error ? error.message : "Controlled Agent Runtime konnte nicht gelesen werden.";
    return Response.json({ ok:false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request){
  try{
    const body = await request.json();
    const requiredPermissions = Array.isArray(body.requiredPermissions) ? body.requiredPermissions.filter((item: unknown): item is string => typeof item === "string") : [];
    const envelope = createControlledAgentRuntimeEnvelope({
      agentId: typeof body.agentId === "string" ? body.agentId : undefined,
      agentName: typeof body.agentName === "string" ? body.agentName : undefined,
      requestedAction: typeof body.requestedAction === "string" ? body.requestedAction : "dry-run",
      requiredPermissions,
      mode: body.mode === "test_mode" ? "test_mode" : "dry_run",
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });
    return Response.json({ ok:true, envelope });
  } catch(error){
    const message = error instanceof Error ? error.message : "Controlled Agent Runtime Envelope konnte nicht erstellt werden.";
    return Response.json({ ok:false, error: message }, { status: 400 });
  }
}
