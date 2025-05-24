import express from 'express';
import multer from 'multer';
import { uploadUserImage, virtualTryOn } from '../controllers/virtualTryOnController.js';
import { getVtonResult } from '../controllers/vtonResultController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload user image and return its URL
router.post('/upload', upload.single('image'), uploadUserImage);

// Virtual try-on endpoint
router.post('/tryon', virtualTryOn);

// Get existing try-on result for user/product
router.post('/vtonresult/get', getVtonResult);

export default router;
