import { listProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulations, simulateProviderDispatchHumanApprovalTokenIssuanceReceiptPolicy, summarizeProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulations } from "../../../lib/provider-dispatch-human-approval-token-issuance-receipt-policy-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { const url = new URL(request.url); const limit = Number(url.searchParams.get("limit") || "50"); const simulations = listProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulations(Number.isFinite(limit) ? limit : 50); return Response.json({ ok: true, summary: summarizeProviderDispatchHumanApprovalTokenIssuanceReceiptPolicySimulations(simulations), simulations }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Receipt Policy Simulationen konnten nicht gelesen werden."; return Response.json({ ok: false, error: message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try { const body = await request.json().catch(() => ({})); const simulation = simulateProviderDispatchHumanApprovalTokenIssuanceReceiptPolicy(typeof body.sourceReceiptId === "string" ? body.sourceReceiptId : undefined); return Response.json({ ok: true, simulation }, { status: 201 }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Receipt Policy Simulation konnte nicht erstellt werden."; return Response.json({ ok: false, error: message }, { status: 400 }); }
}
