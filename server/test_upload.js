import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import { processDocumentWithAI } from './services/ai.service.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const filePath = "uploads\\6a4a6c556fd4b3b0a67c7ecb\\1783262308616-986110172-harshibar_s_resume__1___2_.pdf";
const targetPath = path.join(process.cwd(), filePath);

console.log('Sending upload request for:', targetPath);

try {
  const result = await processDocumentWithAI(
    targetPath,
    'test_user_node',
    'test_doc_node',
    'harshibar_s_resume__1___2_.pdf'
  );
  console.log('Success! Result:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Upload failed!');
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else {
    console.error('Message:', error.message);
  }
}
process.exit(0);
