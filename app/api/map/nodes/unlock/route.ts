import { NextRequest, NextResponse } from 'next/server';
import { unlockNodeAction } from '@/app/actions/map';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nodeId, topic } = body;

    if (!nodeId) {
      return NextResponse.json(
        { success: false, error: 'nodeId is required' },
        { status: 400 }
      );
    }

    const result = await unlockNodeAction(nodeId, topic);
    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
