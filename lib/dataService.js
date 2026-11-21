import mongoose from 'mongoose';
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

function escapeRegex(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPlain(data) {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data));
}

// Projection fields for job listings (avoids loading massive description/requirements text for simple cards)
const JOB_LIST_SELECT =
  'title category jobType workMode location salaryMin salaryMax salaryCurrency salaryType experienceLevel openings deadline status isFeatured createdAt company skills views postedBy';

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
    includeDetails = false,
  } = query;

  const filter = {};
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (postedBy) {
    filter.postedBy = postedBy;
  }

  if (q && typeof q === 'string') {
    const safeQ = escapeRegex(q.trim());
    filter.$or = [
      { title: { $regex: safeQ, $options: 'i' } },
      { skills: { $in: [new RegExp(safeQ, 'i')] } },
    ];
  }

  if (location && typeof location === 'string') {
    filter.location = { $regex: escapeRegex(location.trim()), $options: 'i' };
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

  if (category && typeof category === 'string') {
    const safeCategory = escapeRegex(category.trim());
    const hyphenReplaced = escapeRegex(category.replace(/-/g, ' ').trim());
    filter.$or = [
      { category: safeCategory },
      { category: { $regex: new RegExp(`^${hyphenReplaced}$`, 'i') } },
      { category: { $regex: new RegExp(safeCategory, 'i') } },
    ];
  }

  if (salaryMin) {
    const min = Number(salaryMin);
    if (!isNaN(min) && min > 0) {
      filter.salaryMax = { $gte: min };
    }
  }

  if (salaryMax) {
    const max = Number(salaryMax);
    if (!isNaN(max) && max > 0) {
      filter.salaryMin = { $lte: max };
    }
  }

  if (datePosted) {
    const now = new Date();
    let past;
    if (datePosted === '24h') past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    else if (datePosted === '7d') past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (datePosted === '30d') past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (past) filter.createdAt = { $gte: past };
  }

  let sortOptions = { createdAt: -1, _id: -1 };
  if (sort === 'salary') sortOptions = { salaryMax: -1, _id: -1 };
  else if (sort === 'views') sortOptions = { views: -1, _id: -1 };

  const sanitizedPage = Math.max(1, parseInt(page, 10) || 1);
  const sanitizedLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const skip = (sanitizedPage - 1) * sanitizedLimit;

  let queryBuilder = Job.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(sanitizedLimit)
    .populate({
      path: 'company',
      select: 'name logo location isVerified industry size website',
    })
    .lean();

  if (!includeDetails) {
    queryBuilder = queryBuilder.select(JOB_LIST_SELECT);
  }

  const [jobs, total] = await Promise.all([
    queryBuilder,
    Job.countDocuments(filter),
  ]);

  return {
    jobs: toPlain(jobs),
    total,
    page: sanitizedPage,
    totalPages: Math.ceil(total / sanitizedLimit) || 1,
  };
}

export async function getJobById(id) {
  await dbConnect();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

  try {
    const job = await Job.findById(id)
      .populate('company')
      .lean();

    if (job) {
      // Fire-and-forget view count increment (disabled during visual testing)
      if (process.env.VISUAL_TEST !== 'true') {
        Job.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();
      }
      return toPlain(job);
    }
  } catch {
    return null;
  }
  return null;
}

export async function getCompanyById(id) {
  await dbConnect();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

  try {
    const comp = await Company.findById(id).lean();
    return toPlain(comp);
  } catch {
    return null;
  }
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

  // Calculate live, real job counts per category
  const counts = await Job.aggregate([
    { $match: { status: 'Active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    if (c._id) countMap[String(c._id).toLowerCase()] = c.count;
  });

  return toPlain(
    cats.map((cat) => ({
      ...cat,
      jobCount: countMap[String(cat.name).toLowerCase()] || 0,
    }))
  );
}

export async function getCompanies(limit = 50) {
  await dbConnect();
  const sanitizedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const companies = await Company.find()
    .select('name logo website industry size about location isVerified createdAt')
    .sort({ createdAt: -1 })
    .limit(sanitizedLimit)
    .lean();
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
