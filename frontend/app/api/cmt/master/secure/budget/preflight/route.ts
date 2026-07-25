import { NextResponse } from 'next/server';
import { createSecureMasterBudgetPreflightResult } from '../../../../../../../lib/cmt-secure-master-budget-preflight';

export async function GET() {
  return NextResponse.json(createSecureMasterBudgetPreflightResult());
}
