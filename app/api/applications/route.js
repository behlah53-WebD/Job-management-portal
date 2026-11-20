import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Application from '@/models/Application';
import Job from '@/models/Job';
import Notification from '@/models/Notification';
import { sendPush } from '@/lib/pwa/push';
import { applySchema } from '@/lib/validators';
import { rateLimit } from '@/lib/ratelimit';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    await dbConnect();

    const filter = {};
    if (session.user.role === 'jobseeker') {
      filter.applicant = session.user.id;
    } else if (session.user.role === 'employer') {
      // Employer wants either a specific job or all their jobs' applicants
      if (jobId) {
        filter.job = jobId;
      } else {
        const employerJobs = await Job.find({ postedBy: session.user.id }).select('_id');
        const jobIds = employerJobs.map((j) => j._id);
        filter.job = { $in: jobIds };
      }
    } else if (session.user.role === 'admin') {
      if (jobId) filter.job = jobId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        populate: { path: 'company' },
      })
      .populate('applicant', 'name email avatar phone location')
      .sort({ appliedAt: -1 })
      .lean();

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Please sign in to apply for this job.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'jobseeker') {
      return NextResponse.json(
        { error: 'Only job seekers can apply for open positions.' },
        { status: 403 }
      );
    }

    // Rate limit applications (max 15 applies per minute per user)
    const limiter = await rateLimit(`apply_${session.user.id}`, 15, 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: 'You are applying too quickly. Please pause a moment 🌱' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = applySchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'Invalid application details';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { jobId, resumeUrl, coverLetter } = validation.data;

    await dbConnect();

    // Check duplicate application
    const existing = await Application.findOne({
      job: jobId,
      applicant: session.user.id,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already submitted an application for this position.' },
        { status: 409 }
      );
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json({ error: 'This job is no longer available.' }, { status: 404 });
    }

    const application = await Application.create({
      job: jobId,
      applicant: session.user.id,
      resumeUrl,
      coverLetter: coverLetter || '',
      status: 'Applied',
      statusHistory: [{ status: 'Applied', date: new Date() }],
      appliedAt: new Date(),
    });

    // Notify the employer
    if (job.postedBy) {
      await Notification.create({
        user: job.postedBy,
        message: `New candidate applied for "${job.title}": ${session.user.name}`,
        type: 'new_application',
        link: '/dashboard/employer/applicants',
      });
      sendPush(job.postedBy, {
        title: 'New Candidate Applied 🌱',
        body: `${session.user.name} applied for "${job.title}"`,
        data: { url: '/dashboard/employer/applicants' },
      }).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Nice! Your application is on its way 🌱',
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Application POST error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { applicationId, status, employerNote } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: 'Missing applicationId or status' }, { status: 400 });
    }

    await dbConnect();
    const app = await Application.findById(applicationId).populate('job');
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permission: employer who posted the job or admin or seeker withdrawing
    const isOwnerEmployer =
      session.user.role === 'employer' &&
      app.job.postedBy.toString() === session.user.id;
    const isAdmin = session.user.role === 'admin';
    const isApplicantWithdrawing =
      session.user.role === 'jobseeker' &&
      app.applicant.toString() === session.user.id &&
      status === 'Withdrawn';

    if (!isOwnerEmployer && !isAdmin && !isApplicantWithdrawing) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const previousStatus = app.status;
    const isStatusChanged = status && status !== previousStatus;

    if (isStatusChanged) {
      app.status = status;
      app.statusHistory.push({ status, date: new Date() });
    }

    if (employerNote !== undefined) {
      app.employerNote = employerNote;
    }

    await app.save();

    // Notify applicant ONLY if status actually changed (and unless withdrawn by applicant)
    if (isStatusChanged && status !== 'Withdrawn') {
      const message = `Your application for "${app.job.title}" is now ${status}.`;

      // Deduplication check: do not create if an identical notification was sent in the last 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const recentNotif = await Notification.findOne({
        user: app.applicant,
        message,
        createdAt: { $gte: tenMinutesAgo },
      });

      if (!recentNotif) {
        await Notification.create({
          user: app.applicant,
          message,
          type: 'status_update',
          link: '/dashboard/seeker/applications',
        });
        sendPush(app.applicant, {
          title: 'Application Update 🌿',
          body: message,
          data: { url: '/dashboard/seeker/applications' },
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, application: app });
  } catch (error) {
    console.error('Application PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}
