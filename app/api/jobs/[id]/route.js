import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import { getJobById } from '@/lib/dataService';
import { jobPostSchema } from '@/lib/validators';

export async function GET(req, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = await getJobById(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const res = NextResponse.json(job);
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res;
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

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await req.json();
    const validation = jobPostSchema.partial().safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'Invalid job update data';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

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

    const updated = await Job.findByIdAndUpdate(id, validation.data, { new: true }).populate('company');

    try {
      revalidatePath('/');
      revalidatePath('/jobs');
      revalidatePath(`/jobs/${id}`);
      revalidatePath('/dashboard/employer/my-jobs');
    } catch {}

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

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

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

    try {
      revalidatePath('/');
      revalidatePath('/jobs');
      revalidatePath(`/jobs/${id}`);
      revalidatePath('/dashboard/employer/my-jobs');
    } catch {}

    return NextResponse.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Job DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}
