import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify Vercel Cron authorization header or query param
    const { searchParams } = new URL(req.url);
    const queryKey = searchParams.get('key');

    if (
      authHeader !== `Bearer ${cronSecret}` &&
      queryKey !== cronSecret
    ) {
      return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    await dbConnect();

    const now = new Date();
    const result = await Job.updateMany(
      {
        deadline: { $lt: now },
        status: 'Active',
      },
      {
        $set: { status: 'Closed' },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Expired ${result.modifiedCount} jobs that exceeded deadline.`,
      closedCount: result.modifiedCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Expire cron error:', error);
    return NextResponse.json({ error: 'Failed to run cron job' }, { status: 500 });
  }
}
