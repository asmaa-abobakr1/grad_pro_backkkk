import express from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ─── Helper: create URL-safe slug ────────────────────────────────────────────
const toSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── GET /api/categories ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');

    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({
          category: cat.name,
          status:   'Published',
        });
        return { ...cat.toObject(), count };
      })
    );

    res.json({ success: true, data: withCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/categories ── Admin only ───────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, icon, color, desc } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = toSlug(name);

    // Check duplicate name or slug
    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      icon:  icon  || 'Sparkles',
      color: color || '#2563EB',
      desc:  desc  || '',
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/categories/:id ── Admin only ────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID.' });
    }

    const { name, icon, color, desc, isActive } = req.body;
    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Category name cannot be empty.' });
      }
      updates.name = name.trim();
      updates.slug = toSlug(name); // keep slug in sync with name
    }
    if (icon     !== undefined) updates.icon     = icon;
    if (color    !== undefined) updates.color    = color;
    if (desc     !== undefined) updates.desc     = desc;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A category with this name already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/categories/:id ── Admin only ────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID.' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    // Warn if products are still using this category
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete "${category.name}" — ${productCount} product(s) are still assigned to it.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
