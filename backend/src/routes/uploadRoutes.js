import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import cloudinary, { uploadSignature } from '../config/cloudinary.js';

const router = express.Router();

router.post(
  '/signature',
  protect,
  uploadSignature.single('signature'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please select an image file to upload' });
      }

      // Upload the memory buffer directly to Cloudinary via a stream
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'expense_voucher_signatures',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          transformation: [{ width: 800, height: 400, crop: 'limit' }],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error:', error);
            return res.status(500).json({ message: 'Failed to upload image' });
          }

          // Return the secure URL provided by Cloudinary
          res.status(200).json({
            message: 'Signature uploaded successfully',
            imageUrl: result.secure_url,
          });
        }
      );

      // Pipe the buffer to the stream
      uploadStream.end(req.file.buffer);

    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;