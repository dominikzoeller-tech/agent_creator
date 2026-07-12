import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveCompletionFinalClosureFinalReceiptPolicyAudit } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-final-receipt-policy-audit-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveCompletionFinalClosureFinalReceiptPolicyAudit());
}
