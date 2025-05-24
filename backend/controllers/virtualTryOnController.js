import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import dotenv from 'dotenv';
import vtonResultModel from '../models/vtonResultModel.js'; // <-- import model

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadUserImage = async (req, res) => {
  try {
    // REMOVE userId check (no auth required)
    if (!req.file) return res.json({ success: false, message: 'No file uploaded' });

    cloudinary.uploader.upload_stream(
      { resource_type: 'image', folder: 'virtual-tryon' },
      (error, result) => {
        if (error) return res.json({ success: false, message: error.message });
        res.json({ success: true, url: result.secure_url });
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const virtualTryOn = async (req, res) => {
  // REMOVE userId check (no auth required)
  const { userImageUrl, garmentImageUrl, category, garment_des, userId, productId } = req.body;

  if (!userImageUrl || !garmentImageUrl) {
    return res.status(400).json({ success: false, message: 'Missing image URLs' });
  }

  try {
    const response = await axios.post('https://api.segmind.com/v1/idm-vton', {
      human_img: userImageUrl,
      garm_img: garmentImageUrl,
      category: category || 'upper_body',
      garment_des: garment_des || '',
      crop: true,
      seed: 42,
      steps: 30
    }, {
      headers: {
        'x-api-key': process.env.SEGMIND_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });

    const uploaded = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'virtual-tryon/results' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(Buffer.from(response.data, 'binary'));
    });

    // Save to vtonResultModel if userId and productId are provided
    if (userId && productId) {
      try {
        // Upsert: update if exists, else create
        await vtonResultModel.findOneAndUpdate(
          { userId, productId },
          { vtn_link: uploaded.secure_url },
          { upsert: true, new: true }
        );
      } catch (err) {
        // Log but don't block response
        console.error('Failed to save vton result:', err.message);
      }
    }

    res.json({ success: true, tryonUrl: uploaded.secure_url });

  } catch (error) {
    console.error('Try-on error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Try-on failed'
    });
  }
};
