import { NextRequest, NextResponse } from 'next/server';
import { getMapNodesAction } from '@/app/actions/map';

export async function GET() {
  try {
    const result = await getMapNodesAction();
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
