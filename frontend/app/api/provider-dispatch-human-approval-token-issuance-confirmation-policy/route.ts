import { NextRequest, NextResponse } from "next/server";
import { listProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulations, simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy } from "../../../lib/provider-dispatch-human-approval-token-issuance-confirmation-policy-store";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") || "50");
  const simulations = listProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicySimulations(limit);
  return NextResponse.json({ summary: { count: simulations.length, dryRunOnly: true, networkCallPerformed: false, providerExecutionAllowed: false }, simulations });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const simulation = simulateProviderDispatchHumanApprovalTokenIssuanceConfirmationPolicy(body?.sourceConfirmationId);
  return NextResponse.json({ simulation }, { status: 201 });
}
