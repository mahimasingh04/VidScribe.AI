// utils/uploadFile.js
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure S3 client
const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT, // LocalStack: 'http://localhost:4566'
  s3ForcePathStyle: true, // Required for LocalStack
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  region: process.env.AWS_REGION || 'ap-south-1'
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Creates S3 bucket if it doesn't exist
 */
async function ensureBucketExists() {
  try {
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    console.log(`Bucket ${BUCKET_NAME} exists`);
  } catch (err) {
    if (err.statusCode === 404) {
      console.log(`Creating bucket ${BUCKET_NAME}`);
      await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
      await s3.waitFor('bucketExists', { Bucket: BUCKET_NAME }).promise();
      console.log(`Bucket ${BUCKET_NAME} created`);
    } else {
      throw new Error(`S3 error: ${err.message}`);
    }
  }
}

/**
 * Uploads a file to S3
 * @param {File} file - The file to upload
 * @returns {Promise<string>} Public URL of uploaded file
 */
export const uploadToS3 = async (file) => {
  try {
    // 1. Ensure bucket exists
    await ensureBucketExists();
    
    // 2. Prepare file
    const extension = file.name.split('.').pop();
    const key = `${uuidv4()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 3. Upload parameters
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read' // Make file publicly accessible
    };
    
    // 4. Execute upload
    const { Location } = await s3.upload(params).promise();
    console.log(`File uploaded to ${Location}`);
    
    // 5. Return public URL
    return Location;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};