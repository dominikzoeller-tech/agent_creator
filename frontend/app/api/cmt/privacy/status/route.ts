import { NextResponse } from 'next/server';
import { getPrivacyGateStatus } from '../../../../../lib/cmt-privacy-status';

export async function GET() {
  return NextResponse.json(getPrivacyGateStatus());
}
