import { createProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelope, listProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelopes, summarizeProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelopes } from "../../../lib/provider-dispatch-human-approval-token-issuance-candidate-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { const url = new URL(request.url); const limit = Number(url.searchParams.get("limit") || "100"); const providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopes = listProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelopes(Number.isFinite(limit) ? limit : 100); return Response.json({ ok: true, summary: summarizeProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelopes(providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopes), providerDispatchHumanApprovalTokenIssuanceCandidateEnvelopes }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Candidate Envelopes konnten nicht gelesen werden."; return Response.json({ ok: false, error: message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try { const body = await request.json(); const envelope = createProviderDispatchHumanApprovalTokenIssuanceCandidateEnvelope({ providerDispatchHumanApprovalTokenPolicySimulationId: typeof body.providerDispatchHumanApprovalTokenPolicySimulationId === "string" ? body.providerDispatchHumanApprovalTokenPolicySimulationId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined }); return Response.json({ ok: true, envelope }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Candidate Envelope konnte nicht erstellt werden."; return Response.json({ ok: false, error: message }, { status: 400 }); }
}
