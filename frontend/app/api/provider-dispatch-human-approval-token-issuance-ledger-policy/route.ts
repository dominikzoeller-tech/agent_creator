import { NextRequest, NextResponse } from "next/server";
import { listProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulations, simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy } from "../../../lib/provider-dispatch-human-approval-token-issuance-ledger-policy-store";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") || "50");
  const simulations = listProviderDispatchHumanApprovalTokenIssuanceLedgerPolicySimulations(limit);
  return NextResponse.json({ simulations, summary: { count: simulations.length, dryRunOnly: true, networkCallPerformed: false, providerExecutionAllowed: false } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const simulation = simulateProviderDispatchHumanApprovalTokenIssuanceLedgerPolicy(body?.sourceLedgerEntryId);
  return NextResponse.json({ simulation }, { status: 201 });
}
