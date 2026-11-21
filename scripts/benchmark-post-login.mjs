import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Company from '../models/Company.js';
import JobSeekerProfile from '../models/JobSeekerProfile.js';
import Report from '../models/Report.js';
import PlatformSetting from '../models/PlatformSetting.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function benchmark() {
  console.log('--- STARTING POST-LOGIN WATERFALL BENCHMARK ---\n');
  const tStart = performance.now();
  await mongoose.connect(MONGODB_URI);
  const dbConnectMs = performance.now() - tStart;
  console.log(`[DB Connect] Initial connect: ${dbConnectMs.toFixed(2)}ms\n`);

  // 1. Credentials Lookup & Password Verification (Login API)
  const tLoginStart = performance.now();
  const testUser = await User.findOne({ email: 'ananya@gmail.com' }).select('+password').lean();
  const userQueryMs = performance.now() - tLoginStart;
  const tBcryptStart = performance.now();
  const isMatch = await bcrypt.compare('Seeker@123', testUser.password);
  const bcryptMs = performance.now() - tBcryptStart;
  const loginTotalMs = performance.now() - tLoginStart;

  console.log(`[Login Step]`);
  console.log(`  - User Lookup (DB): ${userQueryMs.toFixed(2)}ms`);
  console.log(`  - Bcrypt Compare: ${bcryptMs.toFixed(2)}ms`);
  console.log(`  - Total Login Handler Time: ${loginTotalMs.toFixed(2)}ms (isMatch: ${isMatch})`);

  // 2. Seeker Dashboard Individual Queries (Unoptimized Waterfall)
  console.log(`\n[Seeker Dashboard Queries - Currently 4 Separate HTTP Requests]`);

  // Call A: /api/users/profile
  const tProfStart = performance.now();
  const [userProfile, profileDoc] = await Promise.all([
    User.findById(testUser._id).select('-password').lean(),
    JobSeekerProfile.findOne({ user: testUser._id }).lean(),
  ]);
  const profMs = performance.now() - tProfStart;
  console.log(`  - /api/users/profile (User + Profile doc): ${profMs.toFixed(2)}ms`);

  // Call B: /api/applications (Seeker)
  const tAppsStart = performance.now();
  const seekerApps = await Application.find({ applicant: testUser._id })
    .populate({
      path: 'job',
      populate: { path: 'company' },
    })
    .populate('applicant', 'name email avatar phone location')
    .sort({ appliedAt: -1 })
    .lean();
  const appsMs = performance.now() - tAppsStart;
  console.log(`  - /api/applications (Deep nested populates): ${appsMs.toFixed(2)}ms (${seekerApps.length} records)`);

  // Call C: /api/saved
  const tSavedStart = performance.now();
  const savedJobs = await SavedJob.find({ user: testUser._id })
    .populate({
      path: 'job',
      populate: { path: 'company' },
    })
    .lean();
  const savedMs = performance.now() - tSavedStart;
  console.log(`  - /api/saved (Populate job + company): ${savedMs.toFixed(2)}ms (${savedJobs.length} records)`);

  // Call D: /api/jobs?limit=4
  const tJobsStart = performance.now();
  const [recommendedJobs, totalJobs] = await Promise.all([
    Job.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('company')
      .lean(),
    Job.countDocuments({ status: 'Active' }),
  ]);
  const jobsMs = performance.now() - tJobsStart;
  console.log(`  - /api/jobs?limit=4 (Jobs query + count): ${jobsMs.toFixed(2)}ms`);

  // Total Seeker Waterfall if serial vs parallel
  const seekerSerialMs = profMs + appsMs + savedMs + jobsMs;
  console.log(`  * Total DB execution time across separate calls: ${seekerSerialMs.toFixed(2)}ms`);

  // 3. Employer Dashboard Queries
  console.log(`\n[Employer Dashboard Queries - Currently 3 Separate HTTP Requests]`);
  const employerUser = await User.findOne({ email: 'aarav@floralabs.io' }).lean();

  const tEmpCompStart = performance.now();
  const empCompany = await Company.findOne({ owner: employerUser._id }).lean();
  const empCompMs = performance.now() - tEmpCompStart;
  console.log(`  - /api/companies?mine=true: ${empCompMs.toFixed(2)}ms`);

  const tEmpJobsStart = performance.now();
  const employerJobs = await Job.find({ postedBy: employerUser._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('company')
    .lean();
  const empJobsMs = performance.now() - tEmpJobsStart;
  console.log(`  - /api/jobs?mine=true&limit=10: ${empJobsMs.toFixed(2)}ms (${employerJobs.length} jobs)`);

  const tEmpAppsStart = performance.now();
  const jobIds = employerJobs.map((j) => j._id);
  const employerApps = await Application.find({ job: { $in: jobIds } })
    .populate({
      path: 'job',
      populate: { path: 'company' },
    })
    .populate('applicant', 'name email avatar phone location')
    .sort({ appliedAt: -1 })
    .lean();
  const empAppsMs = performance.now() - tEmpAppsStart;
  console.log(`  - /api/applications (Employer pipeline): ${empAppsMs.toFixed(2)}ms (${employerApps.length} applicants)`);

  // 4. Admin Dashboard Queries
  console.log(`\n[Admin Dashboard Queries]`);
  const tAdminStart = performance.now();
  const [
    totalUsers,
    totalEmployers,
    totalJobsCount,
    totalAppsCount,
    pendingJobsCount,
    pendingReportsCount,
  ] = await Promise.all([
    User.countDocuments({ role: 'jobseeker' }),
    User.countDocuments({ role: 'employer' }),
    Job.countDocuments(),
    Application.countDocuments(),
    Job.countDocuments({ status: 'Pending' }),
    Report.countDocuments({ status: 'Pending' }),
  ]);
  const adminStatsMs = performance.now() - tAdminStart;
  console.log(`  - /api/admin/stats: ${adminStatsMs.toFixed(2)}ms`);

  await mongoose.disconnect();
  console.log('\n--- BENCHMARK COMPLETE ---');
}

benchmark().catch((err) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
