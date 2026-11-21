import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'],
      default: 'Full-time',
      index: true,
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
      index: true,
    },
    location: {
      type: String,
      required: true,
      default: 'Remote',
      trim: true,
    },
    salaryMin: {
      type: Number,
      default: 0,
    },
    salaryMax: {
      type: Number,
      default: 0,
    },
    salaryCurrency: {
      type: String,
      default: 'INR',
    },
    salaryType: {
      type: String,
      enum: ['monthly', 'yearly', 'stipend'],
      default: 'yearly',
    },
    experienceLevel: {
      type: String,
      enum: ['Fresher', '1-3', '3-5', '5+'],
      default: '1-3',
      index: true,
    },
    openings: {
      type: Number,
      default: 1,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed', 'Pending', 'Rejected'],
      default: 'Active',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ status: 1, category: 1, createdAt: -1 });
JobSchema.index({ status: 1, workMode: 1, createdAt: -1 });
JobSchema.index({ status: 1, jobType: 1, createdAt: -1 });
JobSchema.index({ postedBy: 1, createdAt: -1 });
JobSchema.index({ company: 1, createdAt: -1 });
JobSchema.index({ location: 1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
