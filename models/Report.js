import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for reporting'],
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['Pending', 'Resolved', 'Dismissed'],
      default: 'Pending',
      index: true,
    },
    resolutionNote: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate reports of the same job by the same user
ReportSchema.index({ job: 1, reportedBy: 1 }, { unique: true });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
