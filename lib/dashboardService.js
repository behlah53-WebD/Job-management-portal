import mongoose from 'mongoose';
import dbConnect from './dbConnect';
import User from '@/models/User';
import Job from '@/models/Job';
import Application from '@/models/Application';
import SavedJob from '@/models/SavedJob';
import JobSeekerProfile from '@/models/JobSeekerProfile';
import Company from '@/models/Company';
import Report from '@/models/Report';
import PlatformSetting from '@/models/PlatformSetting';

function toPlain(data) {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

// Projection for lightweight dashboard job cards
const DASHBOARD_JOB_SELECT =
  'title category jobType workMode location salaryMin salaryMax salaryCurrency salaryType experienceLevel createdAt company skills isFeatured';

const COMPANY_POPULATE = {
  path: 'company',
  select: 'name logo location isVerified',
};

/**
 * Server-side unified data fetcher for Job Seeker Dashboard.
 * Runs all required queries in parallel inside the server process.
 * Zero client HTTP round-trips required.
 */
export async function getSeekerDashboardData(userId) {
  await dbConnect();
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { applications: [], savedJobs: [], recommendedJobs: [], profile: null, user: null };
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [applications, savedJobs, recommendedJobs, profile, user] = await Promise.all([
    // 1. Applications with lightweight projections
    Application.find({ applicant: userObjectId })
      .select('job status employerNote statusHistory appliedAt createdAt')
      .populate({
        path: 'job',
        select: DASHBOARD_JOB_SELECT,
        populate: COMPANY_POPULATE,
      })
      .sort({ appliedAt: -1 })
      .limit(20)
      .lean(),

    // 2. Saved jobs with lightweight projections
    SavedJob.find({ user: userObjectId })
      .select('job createdAt')
      .populate({
        path: 'job',
        select: DASHBOARD_JOB_SELECT,
        populate: COMPANY_POPULATE,
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    // 3. Recommended active jobs
    Job.find({ status: 'Active' })
      .select(DASHBOARD_JOB_SELECT)
      .populate(COMPANY_POPULATE)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),

    // 4. Seeker profile
    JobSeekerProfile.findOne({ user: userObjectId })
      .select('headline about skills experience education resumeUrl resumeName expectedSalary preferredLocation links')
      .lean(),

    // 5. User basic info
    User.findById(userObjectId)
      .select('name email avatar phone location role')
      .lean(),
  ]);

  return {
    applications: toPlain(applications),
    savedJobs: toPlain(savedJobs.map((s) => s.job).filter(Boolean)),
    recommendedJobs: toPlain(recommendedJobs),
    profile: toPlain(profile),
    user: toPlain(user),
  };
}

/**
 * Server-side unified data fetcher for Employer Dashboard.
 */
export async function getEmployerDashboardData(userId) {
  await dbConnect();
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { company: null, jobs: [], applicants: [] };
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // First fetch company and posted jobs in parallel
  const [company, jobs] = await Promise.all([
    Company.findOne({ owner: userObjectId })
      .select('name logo website industry size about location isVerified')
      .lean(),
    Job.find({ postedBy: userObjectId })
      .select('title category jobType workMode location status views openings deadline createdAt')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean(),
  ]);

  const jobIds = jobs.map((j) => j._id);

  // Fetch applicants for these jobs
  const applicants = jobIds.length > 0
    ? await Application.find({ job: { $in: jobIds } })
        .select('job applicant resumeUrl coverLetter status employerNote statusHistory appliedAt createdAt')
        .populate({
          path: 'job',
          select: 'title category location workMode jobType',
        })
        .populate({
          path: 'applicant',
          select: 'name email avatar phone location',
        })
        .sort({ appliedAt: -1 })
        .limit(30)
        .lean()
    : [];

  return {
    company: toPlain(company),
    jobs: toPlain(jobs),
    applicants: toPlain(applicants),
  };
}

/**
 * Server-side unified data fetcher for Admin Dashboard.
 */
export async function getAdminDashboardData() {
  await dbConnect();

  const now = process.env.VISUAL_TEST === 'true' ? new Date('2026-11-21T00:00:00.000Z') : new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthConfigs = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    monthConfigs.push({ month: months[d.getMonth()], nextD });
  }

  const [
    growth,
    totalUsers,
    totalEmployers,
    totalJobs,
    totalApplications,
    pendingJobs,
    pendingReports,
    pendingJobsList,
    approvalSetting,
  ] = await Promise.all([
    Promise.all(
      monthConfigs.map(async ({ month, nextD }) => {
        const [candidatesCount, jobsCount] = await Promise.all([
          User.countDocuments({ role: 'jobseeker', createdAt: { $lt: nextD } }),
          Job.countDocuments({ createdAt: { $lt: nextD } }),
        ]);
        return { month, candidates: candidatesCount, jobs: jobsCount };
      })
    ),
    User.countDocuments({ role: 'jobseeker' }),
    User.countDocuments({ role: 'employer' }),
    Job.countDocuments(),
    Application.countDocuments(),
    Job.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ status: 'Pending' }),
    Job.find({ status: { $in: ['Pending', 'Active'] } })
      .select('title category workMode location status createdAt company jobType')
      .populate({ path: 'company', select: 'name logo' })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    PlatformSetting.findOne({ key: 'requireJobApproval' }).lean(),
  ]);

  return {
    stats: {
      totalUsers,
      totalEmployers,
      totalJobs,
      totalApplications,
      pendingJobs,
      pendingReports,
      growth,
      requireJobApproval: approvalSetting ? approvalSetting.value : false,
    },
    pendingJobsList: toPlain(pendingJobsList),
  };
}
