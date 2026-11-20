import mongoose from 'mongoose';

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered', 'Rejected', 'Withdrawn'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required'],
    },
    coverLetter: {
      type: String,
      default: '',
      maxlength: 3000,
    },
    status: {
      type: String,
      enum: ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered', 'Rejected', 'Withdrawn'],
      default: 'Applied',
      index: true,
    },
    employerNote: {
      type: String,
      default: '',
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: () => [{ status: 'Applied', date: new Date() }],
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
