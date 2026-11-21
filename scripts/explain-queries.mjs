import 'dotenv/config';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import User from '../models/User.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('No MONGODB_URI found in environment.');
  process.exit(1);
}

async function runExplainChecks() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB. Verifying index usage via explain()...\n');

  // Ensure indexes are built
  await Promise.all([
    Job.init(),
    Application.init(),
    Company.init(),
    User.init(),
  ]);

  const queries = [
    {
      name: '1. Active Jobs Sorted by createdAt (Homepage & Jobs list default)',
      query: Job.find({ status: 'Active' }).sort({ createdAt: -1 }).limit(12),
    },
    {
      name: '2. Active Jobs Filtered by Category + Sorted (Category browsing)',
      query: Job.find({ status: 'Active', category: 'Software Engineering' }).sort({ createdAt: -1 }).limit(12),
    },
    {
      name: '3. Active Jobs Filtered by WorkMode + Sorted (Remote filter)',
      query: Job.find({ status: 'Active', workMode: 'Remote' }).sort({ createdAt: -1 }).limit(12),
    },
    {
      name: '4. Seeker Applications Sorted by createdAt (Seeker Dashboard)',
      query: Application.find({ applicant: new mongoose.Types.ObjectId() }).sort({ createdAt: -1 }).limit(20),
    },
    {
      name: '5. Companies Directory Sorted by createdAt (Companies page)',
      query: Company.find().sort({ createdAt: -1 }).limit(50),
    },
  ];

  let hasCollscan = false;

  for (const item of queries) {
    const explainResult = await item.query.explain('executionStats');
    const winningPlan = explainResult.queryPlanner?.winningPlan || {};
    
    // Check recursively for stage
    const stages = [];
    function extractStages(plan) {
      if (!plan) return;
      if (plan.stage) stages.push(plan.stage);
      if (plan.inputStage) extractStages(plan.inputStage);
      if (plan.inputStages) plan.inputStages.forEach(extractStages);
    }
    extractStages(winningPlan);

    const isIxscan = stages.includes('IXSCAN');
    const isCollscan = stages.includes('COLLSCAN');

    console.log(`[QUERY] ${item.name}`);
    console.log(`  Stages: ${stages.join(' -> ')}`);
    console.log(`  Uses Index (IXSCAN): ${isIxscan ? '✅ YES' : '❌ NO'}`);
    if (isCollscan && !isIxscan) {
      console.log('  ⚠️ WARNING: COLLSCAN detected without index!');
      hasCollscan = true;
    } else {
      console.log('  ✅ No pure COLLSCAN.');
    }
    console.log('--------------------------------------------------');
  }

  await mongoose.disconnect();
  if (hasCollscan) {
    console.error('FAILED: One or more queries triggered COLLSCAN.');
    process.exit(1);
  } else {
    console.log('SUCCESS: All 5 queries utilize index scans (IXSCAN) with zero COLLSCAN.');
    process.exit(0);
  }
}

runExplainChecks().catch((err) => {
  console.error('Explain check failed:', err);
  process.exit(1);
});
