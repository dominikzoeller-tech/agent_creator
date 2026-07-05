import { createProviderDispatchHumanApprovalTokenIssuanceReceipt, listProviderDispatchHumanApprovalTokenIssuanceReceipts, summarizeProviderDispatchHumanApprovalTokenIssuanceReceipts } from "../../../lib/provider-dispatch-human-approval-token-issuance-receipt-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try { const url = new URL(request.url); const limit = Number(url.searchParams.get("limit") || "100"); const providerDispatchHumanApprovalTokenIssuanceReceipts = listProviderDispatchHumanApprovalTokenIssuanceReceipts(Number.isFinite(limit) ? limit : 100); return Response.json({ ok: true, summary: summarizeProviderDispatchHumanApprovalTokenIssuanceReceipts(providerDispatchHumanApprovalTokenIssuanceReceipts), providerDispatchHumanApprovalTokenIssuanceReceipts }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Receipts konnten nicht gelesen werden."; return Response.json({ ok: false, error: message }, { status: 500 }); }
}
export async function POST(request: Request) {
  try { const body = await request.json(); const receipt = createProviderDispatchHumanApprovalTokenIssuanceReceipt({ providerDispatchHumanApprovalTokenIssuanceLedgerEntryId: typeof body.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId === "string" ? body.providerDispatchHumanApprovalTokenIssuanceLedgerEntryId : undefined, metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : undefined }); return Response.json({ ok: true, receipt }); }
  catch (error) { const message = error instanceof Error ? error.message : "Provider Dispatch Human Approval Token Issuance Receipt konnte nicht erstellt werden."; return Response.json({ ok: false, error: message }, { status: 400 }); }
}
