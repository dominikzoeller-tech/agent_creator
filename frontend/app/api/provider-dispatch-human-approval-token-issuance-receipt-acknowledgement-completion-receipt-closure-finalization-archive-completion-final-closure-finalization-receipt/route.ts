import { NextResponse } from 'next/server';
import { getArchiveCompletionFinalClosureFinalizationReceipt } from '../../../lib/provider-dispatch-human-approval-token-issuance-receipt-acknowledgement-completion-receipt-closure-finalization-archive-completion-final-closure-finalization-receipt-store';

export async function GET() {
  return NextResponse.json(getArchiveCompletionFinalClosureFinalizationReceipt());
}
