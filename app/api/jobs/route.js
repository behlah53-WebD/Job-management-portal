import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import Company from '@/models/Company';
import PlatformSetting from '@/models/PlatformSetting';
import { jobPostSchema } from '@/lib/validators';
import { getJobs } from '@/lib/dataService';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine');
    const statusParam = searchParams.get('status');
    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';
    const jobType = searchParams.getAll('jobType');
    const workMode = searchParams.getAll('workMode');
    const experience = searchParams.getAll('experience');
    const salaryMin = searchParams.get('salaryMin') || '';
    const salaryMax = searchParams.get('salaryMax') || '';
    const datePosted = searchParams.get('datePosted') || '';
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let postedByFilter;
    if (mine === 'true') {
      const session = await getServerAuthSession();
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      postedByFilter = session.user.id;
    }

    const result = await getJobs({
      q,
      location,
      category,
      jobType: jobType.length ? jobType : undefined,
      workMode: workMode.length ? workMode : undefined,
      experience: experience.length ? experience : undefined,
      salaryMin,
      salaryMax,
      datePosted,
      sort,
      page,
      limit,
      status: statusParam || (mine === 'true' ? 'all' : 'Active'),
      postedBy: postedByFilter,
    });

    const response = NextResponse.json(result);
    if (mine !== 'true') {
      response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }
    return response;
  } catch (error) {
    console.error('Jobs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (session.user.role !== 'employer' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only employers or admins can post new jobs.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = jobPostSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'Invalid job post data';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const jobData = validation.data;

    await dbConnect();

    // Find company of the current employer
    let company = await Company.findOne({ owner: session.user.id });
    if (!company) {
      company = await Company.create({
        owner: session.user.id,
        name: `${session.user.name}'s Organization`,
        industry: 'Technology',
        location: jobData.location || 'Remote',
        isVerified: true,
      });
    }

    // Check if platform requires admin approval
    const approvalSetting = await PlatformSetting.findOne({ key: 'requireJobApproval' });
    const requiresApproval = approvalSetting ? approvalSetting.value : false;

    let finalStatus = jobData.status || 'Active';
    if (requiresApproval && finalStatus === 'Active' && session.user.role !== 'admin') {
      finalStatus = 'Pending';
    }

    const newJob = await Job.create({
      ...jobData,
      company: company._id,
      postedBy: session.user.id,
      status: finalStatus,
      views: 0,
    });

    try {
      revalidatePath('/');
      revalidatePath('/jobs');
      revalidatePath('/dashboard/employer/my-jobs');
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message:
          finalStatus === 'Pending'
            ? 'Job submitted for admin review 🌱'
            : 'Job posted successfully! 🌿',
        job: newJob,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Job POST error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
