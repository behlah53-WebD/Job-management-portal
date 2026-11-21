import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 100,
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Technology',
      trim: true,
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '11-50',
    },
    about: {
      type: String,
      default: '',
      maxlength: 3000,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index owner for employer dashboard lookups
CompanySchema.index({ owner: 1 });
CompanySchema.index({ name: 1 });
CompanySchema.index({ isVerified: 1, createdAt: -1 });
CompanySchema.index({ createdAt: -1 });

export default mongoose.models.Company || mongoose.model('Company', CompanySchema);
