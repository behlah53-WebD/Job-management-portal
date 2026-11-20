import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Please sign in to report a listing' }, { status: 401 });
    }

    const { jobId, reason } = await req.json();

    if (!jobId || !reason?.trim()) {
      return NextResponse.json({ error: 'Job ID and reason are required' }, { status: 400 });
    }

    await dbConnect();

    // Prevent duplicate reports by the same user
    const existing = await Report.findOne({ job: jobId, reportedBy: session.user.id });
    if (existing) {
      return NextResponse.json(
        { message: 'You have already reported this listing. Our team is reviewing it.' },
        { status: 200 }
      );
    }

    const report = await Report.create({
      job: jobId,
      reportedBy: session.user.id,
      reason: reason.trim(),
      status: 'Pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you. Our trust & safety team will review this role.',
      report,
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
