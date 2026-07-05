import { createProviderDispatchHumanApprovalTokenIssuanceLedgerEntry, listProviderDispatchHumanApprovalTokenIssuanceLedgerEntries, summarizeProviderDispatchHumanApprovalTokenIssuanceLedgerEntries } from "../../../lib/provider-dispatch-human-approval-token-issuance-ledger-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { const url = new URL(request.url); const limit = Number(url.searchParams.get("limit") || "100"); const providerDispatchHumanApprovalTokenIssuanceLedgerEntries = listProviderDispatchHumanApprovalTokenIssuanceLedgerEntries(Number.isFinite(limit) ? limit : 100); return Response.json({ ok: true, summary: summarizeProviderDispatchHumanApprovalTokenIssuanceLedgerEntries(providerDispatchHumanApprovalTokenIssuanceLedgerEntries), providerDispatchHumanApprovalTokenIssuanceLedgerEntries }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Ledger konnte nicht gelesen werden."; return Response.json({ ok: false, error: message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try { const body = await request.json(); const entry = createProviderDispatchHumanApprovalTokenIssuanceLedgerEntry({ providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId: typeof body.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId === "string" ? body.providerDispatchHumanApprovalTokenIssuanceConfirmationEnvelopeId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined }); return Response.json({ ok: true, entry }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Ledger Entry konnte nicht erstellt werden."; return Response.json({ ok: false, error: message }, { status: 400 }); }
}
