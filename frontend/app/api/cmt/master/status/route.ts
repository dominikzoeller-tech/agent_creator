import { NextResponse } from 'next/server';
import { getMasterAgentStatus } from '../../../../../lib/cmt-master-status';

export async function GET() {
  return NextResponse.json(getMasterAgentStatus());
}
