import { uploadToS3 } from '@/utils/fileUpload';
import {NextRequest, NextResponse } from "next/server";
import executeInBackground from '@/app/worker/worker';

export const config = {
  api: {
    bodyParser: false, // Disable built-in body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // This is simplified - in reality use a middleware like multer
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Create a mock file object
    const file = {
      name: 'test-video.mp4',
      type: 'video/mp4',
      arrayBuffer: async () => buffer,
    };

    // 1. Upload to S3
    const s3Url = await uploadToS3(file);
    
    // 2. Send to RabbitMQ
    await executeInBackground('video_processing', {
      videoUrl: s3Url,
      userId: 'test-user',
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      s3Url,
      message: 'Video uploaded and queued for processing'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
}