import { NextResponse } from 'next/server';
import { getCommitteeLocalJsonPlan } from '../../../../lib/cmt-json';

export async function GET() {
  return NextResponse.json(getCommitteeLocalJsonPlan());
}
