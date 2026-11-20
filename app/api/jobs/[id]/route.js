import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import { getJobById } from '@/lib/dataService';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Job GET by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    await dbConnect();
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check ownership or admin
    if (
      existingJob.postedBy.toString() !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await Job.findByIdAndUpdate(id, body, { new: true }).populate('company');
    return NextResponse.json({ success: true, job: updated });
  } catch (error) {
    console.error('Job PUT error:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await dbConnect();
    const existingJob = await Job.findById(id);
    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (
      existingJob.postedBy.toString() !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Job.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Job DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
