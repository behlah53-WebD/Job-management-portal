import dbConnect from './dbConnect';
import Job from '@/models/Job';
import Category from '@/models/Category';
import Company from '@/models/Company';
import Application from '@/models/Application';

const DEFAULT_CATEGORIES = [
  { name: 'Software Engineering', slug: 'software-engineering', icon: 'Code' },
  { name: 'Product & Design', slug: 'product-design', icon: 'Palette' },
  { name: 'Marketing & Growth', slug: 'marketing-growth', icon: 'Megaphone' },
  { name: 'Sales & BD', slug: 'sales-bd', icon: 'TrendingUp' },
  { name: 'Data & AI', slug: 'data-ai', icon: 'Database' },
  { name: 'Finance & Legal', slug: 'finance-legal', icon: 'BadgeDollarSign' },
  { name: 'People & HR', slug: 'people-hr', icon: 'Users' },
  { name: 'Customer Experience', slug: 'customer-experience', icon: 'HeartHandshake' },
];

function toPlain(data) {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

export async function getJobs(query = {}) {
  await dbConnect();

  const {
    q,
    location,
    jobType,
    workMode,
    experience,
    category,
    salaryMin,
    salaryMax,
    datePosted,
    sort = 'recent',
    page = 1,
    limit = 12,
    status = 'Active',
    postedBy,
  } = query;

  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (postedBy) {
    filter.postedBy = postedBy;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { skills: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }

  if (jobType) {
    const types = Array.isArray(jobType) ? jobType : [jobType];
    filter.jobType = { $in: types };
  }

  if (workMode) {
    const modes = Array.isArray(workMode) ? workMode : [workMode];
    filter.workMode = { $in: modes };
  }

  if (experience) {
    const exps = Array.isArray(experience) ? experience : [experience];
    filter.experienceLevel = { $in: exps };
  }

  if (category) {
    filter.$or = [
      { category: category },
      { category: { $regex: new RegExp(category.replace(/-/g, ' '), 'i') } },
    ];
  }

  if (salaryMin) {
    filter.salaryMax = { $gte: Number(salaryMin) };
  }

  if (salaryMax) {
    filter.salaryMin = { $lte: Number(salaryMax) };
  }

  if (datePosted) {
    const now = new Date();
    let past;
    if (datePosted === '24h') past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (datePosted === '7d') past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (datePosted === '30d') past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (past) filter.createdAt = { $gte: past };
  }

  let sortOptions = { createdAt: -1 };
  if (sort === 'salary') sortOptions = { salaryMax: -1 };
  else if (sort === 'views') sortOptions = { views: -1 };

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('company')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return { jobs: toPlain(jobs), total, page, totalPages: Math.ceil(total / limit) || 1 };
}

export async function getJobById(id) {
  await dbConnect();
  try {
    const job = await Job.findById(id).populate('company').lean();
    if (job) {
      // Increment views (fire-and-forget)
      Job.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
      return toPlain(job);
    }
  } catch {
    return null;
  }
  return null;
}

export async function getCategories() {
  await dbConnect();

  let cats = await Category.find().sort({ jobCount: -1 }).lean();

  // If no categories in DB, populate default ones
  if (!cats || cats.length === 0) {
    try {
      await Category.insertMany(DEFAULT_CATEGORIES, { ordered: false });
      cats = await Category.find().lean();
    } catch {
      cats = await Category.find().lean();
    }
  }

  // Calculate live, real job counts per category from the Job collection
  const counts = await Job.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    if (c._id) countMap[c._id.toLowerCase()] = c.count;
  });

  return toPlain(
    cats.map((cat) => ({
      ...cat,
      jobCount: countMap[cat.name.toLowerCase()] || 0,
    }))
  );
}

export async function getCompanies(limit = 50) {
  await dbConnect();
  const companies = await Company.find().sort({ createdAt: -1 }).limit(limit).lean();
  return toPlain(companies);
}

export async function getPlatformStats() {
  await dbConnect();
  const [activeJobs, totalCompanies, totalApplications, verifiedCompanies] = await Promise.all([
    Job.countDocuments({ status: 'Active' }),
    Company.countDocuments(),
    Application.countDocuments(),
    Company.countDocuments({ isVerified: true }),
  ]);

  return {
    activeJobs,
    totalCompanies,
    totalApplications,
    verifiedCompanies,
  };
}
