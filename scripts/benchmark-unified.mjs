import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import Company from '../models/Company.js';
import Report from '../models/Report.js';
import PlatformSetting from '../models/PlatformSetting.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/verdant';

async function run() {
  await mongoose.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  const seeker = await User.findOne({ role: 'jobseeker' }).lean();
  const employer = await User.findOne({ role: 'employer' }).lean();

  console.log('\n--- MEASURING UNIFIED SERVER COMPONENT PARALLEL QUERIES ---');

  // 1. Seeker Dashboard Unified Parallel Query
  const startSeeker = performance.now();
  const seekerUserId = seeker._id;
  const DASHBOARD_JOB_SELECT =
    'title category jobType workMode location salaryMin salaryMax salaryCurrency salaryType experienceLevel createdAt company skills isFeatured';
  const COMPANY_POPULATE = {
    path: 'company',
    select: 'name logo location isVerified',
  };

  const [applications, savedJobs, recommendedJobs, profile, user] = await Promise.all([
    Application.find({ applicant: seekerUserId })
      .select('job status employerNote statusHistory appliedAt createdAt')
      .populate({
        path: 'job',
        select: DASHBOARD_JOB_SELECT,
        populate: COMPANY_POPULATE,
      })
      .sort({ appliedAt: -1 })
      .limit(20)
      .lean(),

    SavedJob.find({ user: seekerUserId })
      .select('job createdAt')
      .populate({
        path: 'job',
        select: DASHBOARD_JOB_SELECT,
        populate: COMPANY_POPULATE,
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    Job.find({ status: 'Active' })
      .select(DASHBOARD_JOB_SELECT)
      .populate(COMPANY_POPULATE)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),

    JobSeekerProfile.findOne({ user: seekerUserId })
      .select('headline about skills experience education resumeUrl resumeName expectedSalary preferredLocation links')
      .lean(),

    User.findById(seekerUserId)
      .select('name email avatar phone location role')
      .lean(),
  ]);
  const seekerTime = (performance.now() - startSeeker).toFixed(2);
  console.log(`[Seeker Unified Server Query]: ${seekerTime}ms (Fetched ${applications.length} applications, ${savedJobs.length} saved, ${recommendedJobs.length} recommended, profile: ${Boolean(profile)})`);

  // 2. Employer Dashboard Unified Parallel Query
  const startEmployer = performance.now();
  const employerUserId = employer._id;
  const [company, jobs] = await Promise.all([
    Company.findOne({ owner: employerUserId })
      .select('name logo website industry size about location isVerified')
      .lean(),
    Job.find({ postedBy: employerUserId })
      .select('title category jobType workMode location status views openings deadline createdAt')
      .sort({ createdAt: -1 })
      .limit(15)
      .lean(),
  ]);

  const jobIds = jobs.map((j) => j._id);
  const employerApplicants = jobIds.length > 0
    ? await Application.find({ job: { $in: jobIds } })
        .select('job applicant resumeUrl coverLetter status employerNote statusHistory appliedAt createdAt')
        .populate({ path: 'job', select: 'title category location workMode jobType' })
        .populate({ path: 'applicant', select: 'name email avatar phone location' })
        .sort({ appliedAt: -1 })
        .limit(30)
        .lean()
    : [];
  const employerTime = (performance.now() - startEmployer).toFixed(2);
  console.log(`[Employer Unified Server Query]: ${employerTime}ms (Fetched ${jobs.length} jobs, ${employerApplicants.length} applicants, company: ${company?.name})`);

  // 3. Admin Dashboard Unified Parallel Query
  const startAdmin = performance.now();
  const now = new Date();
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
  const adminTime = (performance.now() - startAdmin).toFixed(2);
  console.log(`[Admin Unified Server Query]: ${adminTime}ms (Platform total users: ${totalUsers}, jobs: ${totalJobs}, apps: ${totalApplications})`);

  await mongoose.disconnect();
}

run().catch(console.error);
