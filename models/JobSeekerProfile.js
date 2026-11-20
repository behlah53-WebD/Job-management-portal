import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  from: { type: String, trim: true },
  to: { type: String, trim: true },
  description: { type: String, trim: true },
});

const EducationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  institute: { type: String, trim: true },
  year: { type: String, trim: true },
});

const JobSeekerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      default: '',
      trim: true,
      maxlength: 120,
    },
    about: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: [ExperienceSchema],
      default: [],
    },
    education: {
      type: [EducationSchema],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumeName: {
      type: String,
      default: '',
    },
    expectedSalary: {
      type: Number,
      default: 0,
    },
    preferredLocation: {
      type: String,
      default: '',
    },
    links: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.JobSeekerProfile ||
  mongoose.model('JobSeekerProfile', JobSeekerProfileSchema);
