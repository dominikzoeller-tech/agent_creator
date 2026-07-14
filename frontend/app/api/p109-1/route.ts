import { NextResponse } from 'next/server';
import { getPhase109SealReceiptBoundaryPolicyAudit } from '../../../lib/p109-1-store';

export async function GET() {
  return NextResponse.json(getPhase109SealReceiptBoundaryPolicyAudit());
}
