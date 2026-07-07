import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
console.log('Connecting to MONGO_URI:', MONGO_URI);

try {
  await mongoose.connect(MONGO_URI);
  console.log('Connected successfully!');

  // Define schema inline to avoid imports
  const userSchema = new mongoose.Schema({
    username: String,
    email: String
  });
  const User = mongoose.model('User', userSchema);

  const documentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    filename: String,
    fileUrl: String,
    size: Number,
    status: String,
    stats: {
      pages: Number,
      chunks: Number,
      wordCount: Number
    },
    summary: String
  }, { timestamps: true });

  const Document = mongoose.model('Document', documentSchema);

  const users = await User.find({});
  console.log('All users:');
  console.log(JSON.stringify(users, null, 2));

  const docs = await Document.find({}).sort({ createdAt: -1 }).limit(10);
  console.log('Latest 10 documents:');
  console.log(JSON.stringify(docs, null, 2));

  await mongoose.connection.close();
} catch (err) {
  console.error('Error:', err);
}
process.exit(0);
