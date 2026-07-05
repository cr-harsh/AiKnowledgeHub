import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true
    },
    mode: {
      type: String,
      enum: ['ask', 'summarize', 'explain', 'key_points', 'interview_questions'],
      default: 'ask'
    },
    question: {
      type: String,
      default: ''
    },
    answer: {
      type: String,
      required: true
    },
    sourceChunks: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Fetch chat history for a document in chronological order
chatSchema.index({ userId: 1, documentId: 1, createdAt: 1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
