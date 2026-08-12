import { NextRequest, NextResponse } from 'next/server';
import { submitQuizAction } from '@/app/actions/quiz';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await submitQuizAction(body);

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
