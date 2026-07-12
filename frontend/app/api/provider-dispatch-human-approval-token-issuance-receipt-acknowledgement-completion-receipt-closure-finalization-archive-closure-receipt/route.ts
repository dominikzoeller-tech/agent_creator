import { NextResponse } from 'next/server';
import { getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveClosureReceipt } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-closure-receipt-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getProviderDispatchHumanApprovalTokenIssuanceReceiptAcknowledgementCompletionReceiptClosureFinalizationArchiveClosureReceipt());
}
