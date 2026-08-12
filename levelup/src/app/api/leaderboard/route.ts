import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardAction } from '@/app/actions/hunter';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'weekly';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const userId = searchParams.get('userId') || 'usr_12345';

    const result = await getLeaderboardAction(timeframe, limit, userId);

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
