import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveCompletionClosureReceipt } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-closure-receipt-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveCompletionClosureReceipt());
}
