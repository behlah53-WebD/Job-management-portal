import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import SavedJob from '@/models/SavedJob';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const saved = await SavedJob.find({ user: session.user.id })
      .populate({
        path: 'job',
        populate: { path: 'company' },
      })
      .lean();

    return NextResponse.json(saved.map((s) => s.job).filter(Boolean));
  } catch (error) {
    console.error('Saved jobs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    await dbConnect();
    await SavedJob.findOneAndUpdate(
      { user: session.user.id, job: jobId },
      { user: session.user.id, job: jobId },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, message: 'Job saved 🌱' });
  } catch (error) {
    console.error('Saved jobs POST error:', error);
    return NextResponse.json({ error: 'Failed to bookmark job' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    await dbConnect();
    await SavedJob.findOneAndDelete({ user: session.user.id, job: jobId });
    return NextResponse.json({ success: true, message: 'Job removed' });
  } catch (error) {
    console.error('Saved jobs DELETE error:', error);
    return NextResponse.json({ error: 'Failed to unbookmark job' }, { status: 500 });
  }
}
