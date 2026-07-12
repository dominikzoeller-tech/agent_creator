import { NextResponse } from 'next/server';
import { getPhase82ArchiveSealFinalClosureBoundary } from '../../../lib/p82-0-store';

export async function GET() {
  return NextResponse.json(getPhase82ArchiveSealFinalClosureBoundary());
}
