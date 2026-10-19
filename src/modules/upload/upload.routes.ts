import { Router } from 'express';
import { uploadImage, uploadMultiple } from './upload.controller';
import { upload } from '../../utils/upload.util';

const router = Router();

// Upload single file (PDF automatically routed to Supabase Storage, Images to Cloudinary)
router.post('/pdf', upload.single('file'), uploadImage);
router.post('/image', upload.single('file'), uploadImage);
router.post('/', upload.single('file'), uploadImage);

// Upload multiple files
router.post('/multiple', upload.array('files', 10), uploadMultiple);


export default router;
