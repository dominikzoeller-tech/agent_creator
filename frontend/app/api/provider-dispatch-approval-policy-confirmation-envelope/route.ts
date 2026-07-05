import { createProviderDispatchApprovalPolicyConfirmationEnvelope, listProviderDispatchApprovalPolicyConfirmationEnvelopes, summarizeProviderDispatchApprovalPolicyConfirmationEnvelopes } from "../../../lib/provider-dispatch-approval-policy-confirmation-envelope-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") || "100");
    const providerDispatchApprovalPolicyConfirmationEnvelopes = listProviderDispatchApprovalPolicyConfirmationEnvelopes(Number.isFinite(limit) ? limit : 100);
    return Response.json({ ok: true, summary: summarizeProviderDispatchApprovalPolicyConfirmationEnvelopes(providerDispatchApprovalPolicyConfirmationEnvelopes), providerDispatchApprovalPolicyConfirmationEnvelopes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider Dispatch Approval Policy Confirmation Envelopes konnten nicht gelesen werden.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const envelope = createProviderDispatchApprovalPolicyConfirmationEnvelope({ providerDispatchApprovalCandidateEnvelopePolicySimulationId: typeof body.providerDispatchApprovalCandidateEnvelopePolicySimulationId === "string" ? body.providerDispatchApprovalCandidateEnvelopePolicySimulationId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined });
    return Response.json({ ok: true, envelope });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider Dispatch Approval Policy Confirmation Envelope konnte nicht erstellt werden.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
