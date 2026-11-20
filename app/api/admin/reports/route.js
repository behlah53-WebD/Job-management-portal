import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Report from '@/models/Report';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const reports = await Report.find()
      .populate('job', 'title company')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Admin reports GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { reportId, status, resolutionNote } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Missing reportId or status' }, { status: 400 });
    }

    await dbConnect();
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status, ...(resolutionNote && { resolutionNote }) },
      { new: true }
    );
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Admin reports PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
