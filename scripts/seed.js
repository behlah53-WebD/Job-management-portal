const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// We can define the schemas directly in seed script or import to avoid babel/module issues
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: true },
    role: { type: String, enum: ['jobseeker', 'employer', 'admin'] },
    avatar: String,
    phone: String,
    location: String,
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
    headline: String,
    about: String,
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        from: String,
        to: String,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institute: String,
        year: String,
      },
    ],
    resumeUrl: String,
    resumeName: String,
    expectedSalary: Number,
    preferredLocation: String,
    links: {
      github: String,
      linkedin: String,
      portfolio: String,
    },
  },
  { timestamps: true }
);

const companySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    logo: String,
    website: String,
    industry: String,
    size: String,
    about: String,
    location: String,
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    responsibilities: [String],
    requirements: [String],
    skills: [String],
    category: String,
    jobType: String,
    workMode: String,
    location: String,
    salaryMin: Number,
    salaryMax: Number,
    salaryCurrency: { type: String, default: 'INR' },
    salaryType: { type: String, default: 'yearly' },
    experienceLevel: String,
    openings: { type: Number, default: 1 },
    deadline: Date,
    status: { type: String, default: 'Active' },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resumeUrl: String,
    coverLetter: String,
    status: String,
    employerNote: String,
    statusHistory: [
      {
        status: String,
        date: Date,
        note: String,
      },
    ],
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    icon: String,
    jobCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    value: mongoose.Schema.Types.Mixed,
    description: String,
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    type: String,
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const JobSeekerProfile = mongoose.models.JobSeekerProfile || mongoose.model('JobSeekerProfile', profileSchema);
const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const PlatformSetting = mongoose.models.PlatformSetting || mongoose.model('PlatformSetting', settingSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/verdant';
  console.log(`Connecting to MongoDB at: ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB successfully!');
  } catch (err) {
    console.warn('\n======================================================');
    console.warn('⚠️  Could not connect to MongoDB server.');
    console.warn(`Reason: ${err.message}`);
    console.warn('To populate live data, please provide your MongoDB Atlas URI');
    console.warn('in .env.local as: MONGODB_URI="mongodb+srv://..."');
    console.warn('======================================================\n');
    return;
  }

  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    JobSeekerProfile.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Category.deleteMany({}),
    PlatformSetting.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating settings...');
  await PlatformSetting.create([
    { key: 'requireJobApproval', value: false, description: 'Require admin approval before new jobs go live' },
    { key: 'defaultCurrency', value: 'INR', description: 'Default platform currency' },
    { key: 'maintenanceMode', value: false, description: 'Put platform in maintenance mode' },
  ]);

  console.log('Creating categories...');
  const categoriesData = [
    { name: 'Software Engineering', slug: 'software-engineering', icon: 'Code' },
    { name: 'Product & Design', slug: 'product-design', icon: 'Palette' },
    { name: 'Marketing & Growth', slug: 'marketing-growth', icon: 'Megaphone' },
    { name: 'Sales & BD', slug: 'sales-bd', icon: 'TrendingUp' },
    { name: 'Data & AI', slug: 'data-ai', icon: 'Database' },
    { name: 'Finance & Legal', slug: 'finance-legal', icon: 'BadgeDollarSign' },
    { name: 'People & HR', slug: 'people-hr', icon: 'Users' },
    { name: 'Customer Experience', slug: 'customer-experience', icon: 'HeartHandshake' },
  ];
  await Category.insertMany(categoriesData);

  console.log('Hashing passwords...');
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const employerPassword = await bcrypt.hash('Employer@123', 10);
  const seekerPassword = await bcrypt.hash('Seeker@123', 10);

  console.log('Creating Admin...');
  const admin = await User.create({
    name: 'Verdant Administrator',
    email: 'admin@verdant.com',
    password: adminPassword,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: '+91 98200 11223',
    location: 'Bengaluru, India',
    isBlocked: false,
  });

  console.log('Creating Employers & Companies...');
  const employersData = [
    {
      name: 'Aarav Sharma',
      email: 'aarav@floralabs.io',
      company: {
        name: 'Acme Flora Labs',
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=160&auto=format&fit=crop&q=80',
        website: 'https://floralabs.io',
        industry: 'Healthcare & Biotech',
        size: '51-200',
        about: 'Acme Flora Labs crafts sustainable botanical medicines and clean biotech health solutions backed by natural science.',
        location: 'Bengaluru, India',
        isVerified: true,
      },
    },
    {
      name: 'Priya Patel',
      email: 'priya@sproutify.co',
      company: {
        name: 'Sproutify Cloud',
        logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=160&auto=format&fit=crop&q=80',
        website: 'https://sproutify.co',
        industry: 'Enterprise Software',
        size: '201-500',
        about: 'Sproutify builds serene, developer-first cloud infrastructure and carbon-negative edge hosting.',
        location: 'Remote / Mumbai',
        isVerified: true,
      },
    },
    {
      name: 'Kavita Nair',
      email: 'kavita@fernstone.design',
      company: {
        name: 'Fern & Stone Studio',
        logo: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=160&auto=format&fit=crop&q=80',
        website: 'https://fernstone.design',
        industry: 'Digital Design & Branding',
        size: '11-50',
        about: 'Fern & Stone is a premier human-centered design practice crafting calm digital experiences and bespoke brands.',
        location: 'Pune, India',
        isVerified: true,
      },
    },
    {
      name: 'Rohan Verma',
      email: 'rohan@sagemetrics.ai',
      company: {
        name: 'SageMetrics AI',
        logo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
        website: 'https://sagemetrics.ai',
        industry: 'Artificial Intelligence',
        size: '51-200',
        about: 'SageMetrics AI empowers global commerce teams with predictive supply-chain intelligence and sustainable logistics.',
        location: 'Gurugram, India',
        isVerified: true,
      },
    },
    {
      name: 'Vikram Mehta',
      email: 'vikram@greenroots.fin',
      company: {
        name: 'GreenRoots Financial',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=160&auto=format&fit=crop&q=80',
        website: 'https://greenroots.fin',
        industry: 'FinTech',
        size: '201-500',
        about: 'GreenRoots Financial helps conscious individuals invest transparently in ESG funds and solar infrastructure projects.',
        location: 'Hyderabad, India',
        isVerified: true,
      },
    },
  ];

  const createdEmployers = [];
  const createdCompanies = [];

  for (const emp of employersData) {
    const user = await User.create({
      name: emp.name,
      email: emp.email,
      password: employerPassword,
      role: 'employer',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${emp.name.replace(/\s+/g, '')}`,
      phone: '+91 99887 76655',
      location: emp.company.location,
      isBlocked: false,
    });

    const company = await Company.create({
      owner: user._id,
      name: emp.company.name,
      logo: emp.company.logo,
      website: emp.company.website,
      industry: emp.company.industry,
      size: emp.company.size,
      about: emp.company.about,
      location: emp.company.location,
      isVerified: emp.company.isVerified,
    });

    createdEmployers.push(user);
    createdCompanies.push(company);
  }

  console.log('Creating Job Seekers & Profiles...');
  const seekersData = [
    {
      name: 'Ananya Rao',
      email: 'ananya@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      location: 'Bengaluru, India',
      profile: {
        headline: 'Lead Frontend Engineer | React, Next.js & Design Systems',
        about: 'Passionate software craftsman with 5+ years of experience building accessible, high-performance web applications. I care deeply about typography, micro-interactions, and pristine design system tokens.',
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'CSS Modules', 'GraphQL', 'Jest', 'Accessibility (a11y)'],
        experience: [
          {
            title: 'Senior Frontend Engineer',
            company: 'Zenith Labs',
            from: '2021',
            to: 'Present',
            description: 'Led architecture of the core design system and migrated legacy monolith to Next.js App Router, boosting page load speeds by 42%.',
          },
          {
            title: 'Frontend Developer',
            company: 'Botanica Systems',
            from: '2019',
            to: '2021',
            description: 'Built interactive dashboards with D3.js and React for renewable energy tracking across 12 countries.',
          },
        ],
        education: [
          {
            degree: 'B.Tech in Computer Science',
            institute: 'National Institute of Technology, Karnataka',
            year: '2019',
          },
        ],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeName: 'Ananya_Rao_Resume.pdf',
        expectedSalary: 2800000,
        preferredLocation: 'Remote / Bengaluru',
        links: {
          github: 'https://github.com/ananya-rao',
          linkedin: 'https://linkedin.com/in/ananya-rao',
          portfolio: 'https://ananyarao.dev',
        },
      },
    },
    {
      name: 'Aditya Joshi',
      email: 'aditya@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      location: 'Pune, India',
      profile: {
        headline: 'Staff Product Designer & UX Researcher',
        about: 'Holistic product designer focusing on complex workflows, serene visual architecture, and ethical software design. Former design lead at FinScale.',
        skills: ['Figma', 'Product Strategy', 'User Research', 'Design Systems', 'Prototyping', 'Wireframing', 'Information Architecture'],
        experience: [
          {
            title: 'Lead Product Designer',
            company: 'FinScale Protocol',
            from: '2022',
            to: 'Present',
            description: 'Redesigned core onboarding flow, increasing retention by 28%. Mentored team of 4 junior designers.',
          },
        ],
        education: [
          {
            degree: 'Master of Design (M.Des)',
            institute: 'Industrial Design Centre, IIT Bombay',
            year: '2021',
          },
        ],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeName: 'Aditya_Joshi_Portfolio.pdf',
        expectedSalary: 3200000,
        preferredLocation: 'Remote',
        links: {
          linkedin: 'https://linkedin.com/in/adityajoshi',
          portfolio: 'https://adityajoshi.design',
        },
      },
    },
    {
      name: 'Meera Krishnan',
      email: 'meera@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      location: 'Hyderabad, India',
      profile: {
        headline: 'Data Scientist & Machine Learning Specialist',
        about: 'Transforming messy real-world data into clear mathematical insights and production LLM features. Enthusiastic about climate data analytics.',
        skills: ['Python', 'PyTorch', 'SQL', 'Pandas', 'Machine Learning', 'Data Visualization', 'Docker', 'FastAPI'],
        experience: [
          {
            title: 'Data Scientist',
            company: 'TerraData Insights',
            from: '2022',
            to: 'Present',
            description: 'Trained forecasting models with 94% precision for agricultural commodity pricing.',
          },
        ],
        education: [
          {
            degree: 'B.Sc in Mathematics & Statistics',
            institute: 'St. Xavier College, Mumbai',
            year: '2021',
          },
        ],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        resumeName: 'Meera_Krishnan_Data_Resume.pdf',
        expectedSalary: 2200000,
        preferredLocation: 'Hyderabad / Hybrid',
        links: {
          github: 'https://github.com/meerakrish',
          linkedin: 'https://linkedin.com/in/meerakrish',
        },
      },
    },
  ];

  const createdSeekers = [];
  for (const seeker of seekersData) {
    const user = await User.create({
      name: seeker.name,
      email: seeker.email,
      password: seekerPassword,
      role: 'jobseeker',
      avatar: seeker.avatar,
      phone: '+91 97766 55443',
      location: seeker.location,
      isBlocked: false,
    });

    await JobSeekerProfile.create({
      user: user._id,
      ...seeker.profile,
    });

    createdSeekers.push(user);
  }

  console.log('Creating 30 Realistic Jobs across categories...');
  const sampleJobs = [
    {
      companyIndex: 0, // Acme Flora Labs
      title: 'Senior Full Stack Engineer (Next.js & Node)',
      category: 'Software Engineering',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote, India',
      salaryMin: 2200000,
      salaryMax: 3500000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 2,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'We are seeking a thoughtful Senior Full Stack Engineer to lead our customer-facing web platform. You will build high-speed Next.js portals, integrate laboratory telemetry APIs, and maintain our design token system.',
      responsibilities: [
        'Architect scalable, SEO-optimized web applications with Next.js 14 App Router and MongoDB.',
        'Collaborate closely with botanical scientists and UI designers to turn complex data into delightful user flows.',
        'Implement robust authentication, role permissions, and cached API Route Handlers.',
        'Mentor mid-level engineers and conduct meaningful code reviews with a focus on code hygiene and test coverage.',
      ],
      requirements: [
        '4+ years of hands-on experience in modern JavaScript/TypeScript, React, and Node.js.',
        'Deep understanding of Server Components, SSR, database indexing, and performance optimization.',
        'Experience working with MongoDB Atlas, Mongoose, and RESTful/GraphQL APIs.',
        'High agency, strong communication skills, and empathy for users.',
      ],
      skills: ['Next.js', 'React', 'Node.js', 'TypeScript', 'MongoDB', 'CSS Modules', 'REST APIs'],
    },
    {
      companyIndex: 1, // Sproutify Cloud
      title: 'Principal Cloud Systems Architect',
      category: 'Software Engineering',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 4000000,
      salaryMax: 6000000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '5+',
      openings: 1,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Help us scale our green edge cloud infrastructure to thousands of developers across Asia and Europe. You will design multi-region Kubernetes clusters with ultra-low latency.',
      responsibilities: [
        'Architect zero-downtime distributed systems and multi-tenant container orchestration platforms.',
        'Automate cloud deployment pipelines using Terraform and GitOps practices.',
        'Drive security audits, compliance, and automated chaos engineering drills.',
      ],
      requirements: [
        '7+ years architecting high-concurrency cloud environments on AWS or GCP.',
        'Expertise in Kubernetes, Docker, Go or Rust, and Linux networking.',
        'Track record of building highly reliable, fault-tolerant infrastructure.',
      ],
      skills: ['Kubernetes', 'AWS', 'Docker', 'Go', 'Terraform', 'System Architecture'],
    },
    {
      companyIndex: 2, // Fern & Stone Studio
      title: 'Lead Brand & Product Designer',
      category: 'Product & Design',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Pune, Maharashtra',
      salaryMin: 2000000,
      salaryMax: 3200000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Shape the visual language of high-growth tech companies. You will produce brand design systems, web experiences, and mobile UI with craft and care.',
      responsibilities: [
        'Lead end-to-end product design from discovery and low-fi wireframes to polished pixel-perfect Figma deliverables.',
        'Build and maintain scalable Figma design systems with interactive variants and token libraries.',
        'Facilitate design sprints and user feedback sessions with founders and product managers.',
      ],
      requirements: [
        'Proven portfolio exhibiting clean typography, subtle motion design, and purposeful aesthetics.',
        'Expertise in Figma, motion tools (Principle/AfterEffects), and web layout principles.',
      ],
      skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'Typography', 'Branding'],
    },
    {
      companyIndex: 3, // SageMetrics AI
      title: 'Senior Machine Learning Scientist',
      category: 'Data & AI',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Gurugram, Haryana',
      salaryMin: 2800000,
      salaryMax: 4500000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 2,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Build predictive time-series models and fine-tune open weights LLMs for enterprise inventory optimization.',
      responsibilities: [
        'Develop statistical and deep learning models for multi-horizon demand forecasting.',
        'Deploy production inference microservices using Triton, FastAPI, and Kubernetes.',
        'Collaborate with data engineers to optimize feature pipelines on Snowflake and DBT.',
      ],
      requirements: [
        'M.S. or Ph.D. in Computer Science, Statistics, or related quantitative field.',
        '3+ years experience with PyTorch, Scikit-Learn, and MLOps tools.',
      ],
      skills: ['Python', 'PyTorch', 'Machine Learning', 'FastAPI', 'SQL', 'MLOps'],
    },
    {
      companyIndex: 4, // GreenRoots Financial
      title: 'Growth Marketing Manager',
      category: 'Marketing & Growth',
      jobType: 'Full-time',
      workMode: 'On-site',
      location: 'Hyderabad, Telangana',
      salaryMin: 1600000,
      salaryMax: 2400000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Drive organic and paid customer acquisition for India’s fastest-growing ESG investment app.',
      responsibilities: [
        'Own customer acquisition cost (CAC) and conversion rate optimization (CRO) across web and app channels.',
        'Design experiments in paid search, social, influencer partnerships, and educational content.',
      ],
      requirements: [
        '3+ years in growth marketing for a B2C or FinTech mobile application.',
        'Deep mastery of Google Analytics 4, Mixpanel, Meta Ads, and SEO fundamentals.',
      ],
      skills: ['Growth Marketing', 'SEO', 'Performance Marketing', 'Mixpanel', 'CRO'],
    },
    {
      companyIndex: 0,
      title: 'React & UI Engineering Intern',
      category: 'Software Engineering',
      jobType: 'Internship',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 30000,
      salaryMax: 45000,
      salaryCurrency: 'INR',
      salaryType: 'stipend',
      experienceLevel: 'Fresher',
      openings: 3,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'A 6-month intensive internship with direct mentorship from senior staff engineers. Learn modern React, Next.js, and CSS token architecture while contributing to live features.',
      responsibilities: [
        'Write clean, accessible React components following our Figma design system.',
        'Fix bugs and implement responsive UI polish across tablet and mobile viewports.',
        'Participate in daily standups and weekly engineering demos.',
      ],
      requirements: [
        'Strong knowledge of modern JavaScript (ES6+), HTML5, and CSS3.',
        'Hands-on experience building projects with React and Git.',
        'Eagerness to learn and curiosity for clean code.',
      ],
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
    },
    {
      companyIndex: 1,
      title: 'DevOps & Site Reliability Engineer',
      category: 'Software Engineering',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote, India',
      salaryMin: 2400000,
      salaryMax: 3800000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 2,
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Maintain 99.99% uptime across our global edge servers. Implement monitoring, automated canary rollouts, and disaster recovery plans.',
      responsibilities: [
        'Manage Kubernetes clusters, Prometheus, Grafana, and Datadog alerts.',
        'Build CI/CD pipelines with GitHub Actions for automated testing and deployment.',
      ],
      requirements: ['3+ years in DevOps/SRE with strong scripting in Bash or Python.'],
      skills: ['DevOps', 'Kubernetes', 'Docker', 'CI/CD', 'Prometheus', 'Linux'],
    },
    {
      companyIndex: 2,
      title: 'Junior UX Researcher',
      category: 'Product & Design',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Pune, Maharashtra',
      salaryMin: 800000,
      salaryMax: 1400000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 1,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Conduct user interviews, usability audits, and card sorting workshops for sustainable luxury e-commerce brands.',
      responsibilities: [
        'Recruit study participants and synthesize qualitative feedback into actionable design reports.',
        'Collaborate with product designers to prototype solutions.',
      ],
      requirements: ['1-2 years conducting generative or evaluative UX research.'],
      skills: ['UX Research', 'Usability Testing', 'Figma', 'User Interviews'],
    },
    {
      companyIndex: 3,
      title: 'Data Analyst (SQL & Looker)',
      category: 'Data & AI',
      jobType: 'Full-time',
      workMode: 'On-site',
      location: 'Gurugram, Haryana',
      salaryMin: 1200000,
      salaryMax: 1800000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 2,
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Transform customer transaction logs into executive Looker dashboards and customer cohort insights.',
      responsibilities: ['Write high performance SQL queries on BigQuery.', 'Build automated BI reports.'],
      requirements: ['Proficiency in SQL and at least one BI tool (Tableau, Looker, PowerBI).'],
      skills: ['SQL', 'Looker', 'Tableau', 'Data Analysis', 'Python'],
    },
    {
      companyIndex: 4,
      title: 'Enterprise Account Executive (FinTech)',
      category: 'Sales & BD',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Mumbai, Maharashtra',
      salaryMin: 1800000,
      salaryMax: 3000000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Close deals with corporate sustainability officers and wealth advisory firms looking for ESG portfolio software.',
      responsibilities: ['Manage pipeline from demo to contract closing.', 'Consistently hit and exceed quarterly sales quotas.'],
      requirements: ['Proven B2B SaaS sales closing record.'],
      skills: ['B2B Sales', 'CRM', 'Negotiation', 'Enterprise Sales', 'SaaS'],
    },
    {
      companyIndex: 0,
      title: 'Product Operations Specialist',
      category: 'Product & Design',
      jobType: 'Full-time',
      workMode: 'On-site',
      location: 'Bengaluru, Karnataka',
      salaryMin: 1000000,
      salaryMax: 1500000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 1,
      deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Bridge engineering, product, and lab operations to ensure smooth releases and timely bug triage.',
      responsibilities: ['Triage incoming bugs.', 'Create release documentation and train support specialists.'],
      requirements: ['Experience in product operations, technical support, or project coordination.'],
      skills: ['Product Operations', 'Jira', 'Agile', 'Documentation'],
    },
    {
      companyIndex: 1,
      title: 'Lead Technical Writer & Developer Advocate',
      category: 'Marketing & Growth',
      jobType: 'Contract',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 1500000,
      salaryMax: 2200000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Craft world-class API documentation, interactive tutorial guides, and starter kits for edge computing.',
      responsibilities: ['Maintain technical guides and SDK docs.', 'Publish deep-dive architectural blog posts.'],
      requirements: ['Clear writing style and solid coding ability in JavaScript/Node.'],
      skills: ['Technical Writing', 'Developer Relations', 'JavaScript', 'Documentation', 'Markdown'],
    },
    {
      companyIndex: 2,
      title: 'Motion & Visual Designer',
      category: 'Product & Design',
      jobType: 'Freelance',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: 'INR',
      salaryType: 'monthly',
      experienceLevel: '1-3',
      openings: 2,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Produce micro-animations, product explainer videos, and interactive WebGL assets.',
      responsibilities: ['Animate web interactions using Lottie and SVG.', 'Create 3D asset renders.'],
      requirements: ['Proficiency with After Effects, Lottie, and Blender.'],
      skills: ['After Effects', 'Motion Design', 'Lottie', 'Figma', '3D'],
    },
    {
      companyIndex: 3,
      title: 'AI Prompt & Evaluation Engineer',
      category: 'Data & AI',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote, India',
      salaryMin: 1800000,
      salaryMax: 2600000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 2,
      deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Design rigorous evaluation benchmarks, unit tests, and multi-step prompt workflows for enterprise LLM agents.',
      responsibilities: ['Create automated eval datasets.', 'Refine agent tool calling routines.'],
      requirements: ['Experience with LangChain, LlamaIndex, or OpenAI APIs with Python.'],
      skills: ['Prompt Engineering', 'Python', 'LLMs', 'Evals', 'LangChain'],
    },
    {
      companyIndex: 4,
      title: 'Senior People Partner (HR & Culture)',
      category: 'People & HR',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Hyderabad, Telangana',
      salaryMin: 1400000,
      salaryMax: 2000000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Nurture an empathetic, growth-oriented environment across our engineering and business departments.',
      responsibilities: ['Lead performance appraisals, onboarding, and continuous team feedback.', 'Manage talent retention.'],
      requirements: ['3+ years in tech HR or People Operations with strong emotional intelligence.'],
      skills: ['HR', 'Talent Acquisition', 'Culture', 'People Operations', 'Employee Relations'],
    },
    {
      companyIndex: 0,
      title: 'Customer Happiness Lead',
      category: 'Customer Experience',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 800000,
      salaryMax: 1300000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 2,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Deliver warm, compassionate support to healthcare clinics and individuals using our botanical products.',
      responsibilities: ['Respond to inquiries via live chat and email.', 'Identify recurring customer friction points.'],
      requirements: ['Fluent English, high empathy, and customer service experience.'],
      skills: ['Customer Support', 'Zendesk', 'Communication', 'Problem Solving'],
    },
    {
      companyIndex: 1,
      title: 'Backend Go Engineer (High Concurrency)',
      category: 'Software Engineering',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 2800000,
      salaryMax: 4200000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 2,
      deadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Build fast gRPC services and distributed storage nodes in Golang.',
      responsibilities: ['Develop microservices processing 50k+ req/sec.', 'Profile CPU and memory performance.'],
      requirements: ['3+ years of professional Go experience.'],
      skills: ['Go', 'gRPC', 'PostgreSQL', 'Redis', 'Microservices'],
    },
    {
      companyIndex: 2,
      title: 'Design Systems Architect',
      category: 'Product & Design',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 2600000,
      salaryMax: 3800000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '5+',
      openings: 1,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Unify token variables, component contracts, and dark/light modes between Figma and code repositories.',
      responsibilities: ['Maintain multi-brand design tokens.', 'Build accessible React component libraries.'],
      requirements: ['Deep expertise bridging design and front-end code with Storybook and Figma.'],
      skills: ['Design Systems', 'Figma', 'TypeScript', 'CSS', 'Storybook', 'Accessibility'],
    },
    {
      companyIndex: 3,
      title: 'Senior Data Engineer (DBT & Snowflake)',
      category: 'Data & AI',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru / Gurugram',
      salaryMin: 2400000,
      salaryMax: 3600000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Build batch and streaming data pipelines powering real-time financial reporting.',
      responsibilities: ['Model data with DBT.', 'Orchestrate Airflow DAGs.'],
      requirements: ['Solid Python and SQL skills with Snowflake or Redshift experience.'],
      skills: ['Data Engineering', 'Snowflake', 'dbt', 'Airflow', 'Python', 'SQL'],
    },
    {
      companyIndex: 4,
      title: 'Financial Controller & Compliance Manager',
      category: 'Finance & Legal',
      jobType: 'Full-time',
      workMode: 'On-site',
      location: 'Mumbai, Maharashtra',
      salaryMin: 2000000,
      salaryMax: 3000000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '5+',
      openings: 1,
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Oversee corporate financial reporting, statutory audits, and regulatory compliance for our investment platform.',
      responsibilities: ['Lead quarterly financial statements preparation.', 'Liaise with external auditors.'],
      requirements: ['CA/CPA qualified with 4+ years post-qualification experience.'],
      skills: ['Financial Analysis', 'Auditing', 'Compliance', 'Taxation', 'Accounting'],
    },
    {
      companyIndex: 0,
      title: 'Senior QA Automation Engineer',
      category: 'Software Engineering',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 1600000,
      salaryMax: 2400000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Build end-to-end Cypress and Playwright test automation suites to ensure zero regressions across our clinical portal.',
      responsibilities: ['Write maintainable E2E and API tests.', 'Integrate test runs into GitHub Actions.'],
      requirements: ['3+ years in automated web testing using Playwright or Cypress.'],
      skills: ['Playwright', 'Cypress', 'JavaScript', 'QA Automation', 'CI/CD'],
    },
    {
      companyIndex: 1,
      title: 'Technical Account Manager',
      category: 'Customer Experience',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 1800000,
      salaryMax: 2600000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 2,
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Guide enterprise developers in migrating legacy workloads onto Sproutify Cloud edge clusters.',
      responsibilities: ['Conduct architecture reviews.', 'Resolve critical escalation tickets.'],
      requirements: ['Technical background with prior client-facing account management experience.'],
      skills: ['Account Management', 'Cloud Architecture', 'Customer Success', 'Troubleshooting'],
    },
    {
      companyIndex: 2,
      title: 'Content Strategist & Copywriter',
      category: 'Marketing & Growth',
      jobType: 'Part-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 40000,
      salaryMax: 60000,
      salaryCurrency: 'INR',
      salaryType: 'monthly',
      experienceLevel: '1-3',
      openings: 1,
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Write crisp, inspiring UI copy, email digests, and thoughtful case studies for sustainable architecture clients.',
      responsibilities: ['Craft UI micro-copy.', 'Interview studio partners for project stories.'],
      requirements: ['Exceptional written English with an eye for subtle storytelling.'],
      skills: ['Copywriting', 'Content Strategy', 'UX Writing', 'Storytelling'],
    },
    {
      companyIndex: 3,
      title: 'Computer Vision Research Intern',
      category: 'Data & AI',
      jobType: 'Internship',
      workMode: 'Hybrid',
      location: 'Gurugram, Haryana',
      salaryMin: 35000,
      salaryMax: 50000,
      salaryCurrency: 'INR',
      salaryType: 'stipend',
      experienceLevel: 'Fresher',
      openings: 2,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Explore satellite image segmentation and drone aerial analysis for organic tree farm monitoring.',
      responsibilities: ['Annotate and preprocess satellite imagery.', 'Benchmark YOLO and segment-anything models.'],
      requirements: ['Python and PyTorch basics, passion for environmental AI applications.'],
      skills: ['Computer Vision', 'PyTorch', 'Python', 'OpenCV', 'Deep Learning'],
    },
    {
      companyIndex: 4,
      title: 'Business Development Representative',
      category: 'Sales & BD',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Bengaluru / Hyderabad',
      salaryMin: 700000,
      salaryMax: 1100000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: 'Fresher',
      openings: 3,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Identify and qualify potential corporate investment partners across tier 1 tech hubs.',
      responsibilities: ['Prospect leads via LinkedIn Sales Navigator.', 'Schedule qualified meetings for senior partners.'],
      requirements: ['Energetic communicator with quick learning ability.'],
      skills: ['Outbound Sales', 'Lead Generation', 'Cold Calling', 'CRM'],
    },
    {
      companyIndex: 0,
      title: 'Clinical Data Coordinator',
      category: 'Data & AI',
      jobType: 'Full-time',
      workMode: 'On-site',
      location: 'Bengaluru, Karnataka',
      salaryMin: 900000,
      salaryMax: 1400000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 1,
      deadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Maintain regulatory botanical trial logs and clean health dataset entries.',
      responsibilities: ['Audit trial databases for anomalies.', 'Generate compliance status reports.'],
      requirements: ['Experience with clinical trial datasets or health information systems.'],
      skills: ['Clinical Trials', 'Data Validation', 'Excel', 'Healthcare Informatics'],
    },
    {
      companyIndex: 1,
      title: 'Product Security Engineer',
      category: 'Software Engineering',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote',
      salaryMin: 3000000,
      salaryMax: 4800000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '5+',
      openings: 1,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: true,
      status: 'Active',
      description: 'Audit edge cloud infrastructure, perform threat modeling, and protect developer keys and sensitive certificates.',
      responsibilities: ['Conduct static code analysis (SAST) and penetration testing.', 'Maintain SOC2 compliance.'],
      requirements: ['4+ years in application security and cryptography.'],
      skills: ['Cybersecurity', 'Application Security', 'Penetration Testing', 'Cryptography'],
    },
    {
      companyIndex: 2,
      title: 'Design Producer & Project Manager',
      category: 'Product & Design',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Pune, Maharashtra',
      salaryMin: 1200000,
      salaryMax: 1800000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '3-5',
      openings: 1,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Orchestrate studio creative operations, client deliverables, and designer resourcing across 6 client projects.',
      responsibilities: ['Keep design milestones on schedule.', 'Manage client communication and billing stages.'],
      requirements: ['Demonstrated experience running design projects in a fast-paced agency.'],
      skills: ['Project Management', 'Asana', 'Client Management', 'Agile'],
    },
    {
      companyIndex: 3,
      title: 'Talent Acquisition Specialist (Tech)',
      category: 'People & HR',
      jobType: 'Full-time',
      workMode: 'Remote',
      location: 'Remote, India',
      salaryMin: 1100000,
      salaryMax: 1600000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '1-3',
      openings: 1,
      deadline: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Source and recruit senior engineering and AI research talent for SageMetrics AI.',
      responsibilities: ['Manage full lifecycle recruiting.', 'Ensure candidate experience remains respectful and rapid.'],
      requirements: ['2+ years recruiting engineers in Indian tech ecosystems.'],
      skills: ['Technical Recruiting', 'Sourcing', 'Interviewing', 'Candidate Experience'],
    },
    {
      companyIndex: 4,
      title: 'Legal Counsel (Corporate & FinTech)',
      category: 'Finance & Legal',
      jobType: 'Full-time',
      workMode: 'Hybrid',
      location: 'Mumbai, Maharashtra',
      salaryMin: 2200000,
      salaryMax: 3400000,
      salaryCurrency: 'INR',
      salaryType: 'yearly',
      experienceLevel: '5+',
      openings: 1,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isFeatured: false,
      status: 'Active',
      description: 'Draft partnership agreements, investor terms, and review RBI compliance guidelines for our fintech platform.',
      responsibilities: ['Draft and negotiate enterprise contracts.', 'Provide guidance on privacy and financial regulations.'],
      requirements: ['Law degree with 5+ years practicing commercial law.'],
      skills: ['Corporate Law', 'Contract Negotiation', 'FinTech Regulations', 'Compliance'],
    },
  ];

  const createdJobs = [];
  for (let i = 0; i < sampleJobs.length; i++) {
    const jobData = sampleJobs[i];
    const company = createdCompanies[jobData.companyIndex];
    const employer = createdEmployers[jobData.companyIndex];

    const job = await Job.create({
      company: company._id,
      postedBy: employer._id,
      title: jobData.title,
      description: jobData.description,
      responsibilities: jobData.responsibilities,
      requirements: jobData.requirements,
      skills: jobData.skills,
      category: jobData.category,
      jobType: jobData.jobType,
      workMode: jobData.workMode,
      location: jobData.location,
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
      salaryCurrency: jobData.salaryCurrency,
      salaryType: jobData.salaryType,
      experienceLevel: jobData.experienceLevel,
      openings: jobData.openings,
      deadline: jobData.deadline,
      status: jobData.status,
      isFeatured: jobData.isFeatured,
      views: Math.floor(Math.random() * 250) + 20,
    });

    createdJobs.push(job);
  }

  // Update Category job counts
  for (const cat of categoriesData) {
    const count = await Job.countDocuments({ category: cat.name, status: 'Active' });
    await Category.updateOne({ slug: cat.slug }, { jobCount: count });
  }

  console.log('Creating ~20 realistic applications with varied statuses...');
  const applicationStatuses = ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];
  let appCount = 0;

  for (let i = 0; i < createdJobs.length && appCount < 20; i++) {
    const job = createdJobs[i];
    // Pick seeker
    const seeker = createdSeekers[i % createdSeekers.length];
    const status = applicationStatuses[i % applicationStatuses.length];

    const history = [{ status: 'Applied', date: new Date(Date.now() - (7 - (i % 6)) * 24 * 60 * 60 * 1000) }];
    if (status !== 'Applied') {
      history.push({ status: 'Viewed', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) });
    }
    if (['Shortlisted', 'Interview', 'Offered'].includes(status)) {
      history.push({ status: 'Shortlisted', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) });
    }
    if (['Interview', 'Offered'].includes(status)) {
      history.push({ status: 'Interview', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) });
    }
    if (status === 'Offered') {
      history.push({ status: 'Offered', date: new Date() });
    } else if (status === 'Rejected') {
      history.push({ status: 'Rejected', date: new Date() });
    }

    await Application.create({
      job: job._id,
      applicant: seeker._id,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      coverLetter: `Hello hiring team at ${job.company?.name || 'Verdant'},\n\nI am thrilled to apply for the ${job.title} role. My hands-on background and focus on quality align seamlessly with your mission. I would love the opportunity to share how my experience can contribute to your team.`,
      status,
      employerNote: status === 'Shortlisted' ? 'Strong candidate portfolio, schedule round 1 next week.' : '',
      statusHistory: history,
      appliedAt: history[0].date,
    });

    // Create a sample notification for the applicant
    await Notification.create({
      user: seeker._id,
      message: `Your application for "${job.title}" has moved to ${status}.`,
      type: 'status_update',
      link: '/dashboard/seeker/applications',
      isRead: false,
    });

    appCount++;
  }

  console.log('\n=========================================');
  console.log('🌱 Verdant Seed Successful!');
  console.log('Created:');
  console.log(' - 1 Admin: admin@verdant.com (Admin@123)');
  console.log(' - 5 Employers: aarav@floralabs.io, priya@sproutify.co, etc. (Employer@123)');
  console.log(' - 3 Job Seekers: ananya@gmail.com, aditya@gmail.com, meera@gmail.com (Seeker@123)');
  console.log(` - ${createdJobs.length} realistic jobs across 8 categories`);
  console.log(` - ${appCount} applications with varied status pipelines`);
  console.log(' - Platform settings and notifications configured');
  console.log('=========================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
