import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true
    },
    filename: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true // File size in bytes
    },
    status: {
      type: String,
      enum: ['Uploading', 'Processing', 'Ready', 'Failed'],
      default: 'Uploading'
    },
    stats: {
      pages: { type: Number, default: 0 },
      chunks: { type: Number, default: 0 },
      wordCount: { type: Number, default: 0 }
    },
    summary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ userId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
