import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hsvutda8',
  api_key: process.env.CLOUDINARY_API_KEY || '161881619239385',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'RZHz-gHxVZcq-mUVXAgPO-ovMW0',
  secure: true,
});

export default cloudinary;
