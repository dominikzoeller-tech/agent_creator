import { NextResponse } from 'next/server';
import { getArchiveCompletionFinalClosureFinalizationFinalReceiptPolicyAudit } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-final-receipt-policy-audit-store';

export async function GET() {
  return NextResponse.json(getArchiveCompletionFinalClosureFinalizationFinalReceiptPolicyAudit());
}
