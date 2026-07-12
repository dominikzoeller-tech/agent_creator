import { NextResponse } from 'next/server';
import { getArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-policy-audit-store';

export async function GET() {
  return NextResponse.json(getArchiveCompletionFinalClosureFinalizationReceiptPolicyAudit());
}
