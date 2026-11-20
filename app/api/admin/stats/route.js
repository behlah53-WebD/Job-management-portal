import { NextResponse } from 'next/server';
import { getServerAuthSession } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Company from '@/models/Company';
import Job from '@/models/Job';
import Application from '@/models/Application';
import Report from '@/models/Report';
import PlatformSetting from '@/models/PlatformSetting';

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Generate real monthly growth data for the last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const growth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = months[d.getMonth()];
      const [candidatesCount, jobsCount] = await Promise.all([
        User.countDocuments({ role: 'jobseeker', createdAt: { $lt: nextD } }),
        Job.countDocuments({ createdAt: { $lt: nextD } }),
      ]);
      growth.push({ month: monthName, candidates: candidatesCount, jobs: jobsCount });
    }

    const [
      totalUsers,
      totalEmployers,
      totalJobs,
      totalApplications,
      pendingJobs,
      pendingReports,
      approvalSetting,
    ] = await Promise.all([
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments(),
      Application.countDocuments(),
      Job.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ status: 'Pending' }),
      PlatformSetting.findOne({ key: 'requireJobApproval' }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalEmployers,
      totalJobs,
      totalApplications,
      pendingJobs,
      pendingReports,
      growth,
      requireJobApproval: approvalSetting ? approvalSetting.value : false,
    });
  } catch (error) {
    console.error('Admin stats GET error:', error);
    return NextResponse.json({ error: 'Failed to load admin stats' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'Missing setting key' }, { status: 400 });
    }

    await dbConnect();
    await PlatformSetting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Admin stats POST error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
