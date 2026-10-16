import express from 'express';
import { uploadProduct, uploadAvatar, cloudinary } from '../middleware/cloudinary.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ─── Multer error handler helper ─────────────────────────────────────────────
const handleMulterError = (err, res) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Maximum size allowed.' });
  }
  return res.status(400).json({ success: false, message: err.message });
};

// ─── POST /api/upload/product ── Upload single product image (Admin) ─────────
router.post('/product', protect, adminOnly, (req, res) => {
  uploadProduct.single('image')(req, res, (err) => {
    if (err) return handleMulterError(err, res);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    res.json({
      success:  true,
      url:      req.file.path,       // Cloudinary URL
      publicId: req.file.filename,
    });
  });
});

// ─── POST /api/upload/product/multiple ── Multiple product images (Admin) ─────
router.post('/product/multiple', protect, adminOnly, (req, res) => {
  uploadProduct.array('images', 5)(req, res, (err) => {
    if (err) return handleMulterError(err, res);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided.' });
    }

    const urls = req.files.map((f) => ({ url: f.path, publicId: f.filename }));
    res.json({ success: true, images: urls });
  });
});

// ─── POST /api/upload/avatar ── Upload user avatar ────────────────────────────
router.post('/avatar', protect, (req, res) => {
  uploadAvatar.single('avatar')(req, res, (err) => {
    if (err) return handleMulterError(err, res);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No avatar file provided.' });
    }

    res.json({ success: true, url: req.file.path, publicId: req.file.filename });
  });
});

// ─── DELETE /api/upload/:publicId ── Delete image from Cloudinary (Admin) ─────
router.delete('/:publicId', protect, adminOnly, async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Public ID is required.' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(400).json({ success: false, message: 'Failed to delete image from Cloudinary.' });
    }

    res.json({ success: true, message: 'Image deleted.', result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
