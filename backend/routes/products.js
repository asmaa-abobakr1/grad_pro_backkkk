import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ─── GET /api/products/brands ── all unique brands ────────────────────────────
// IMPORTANT: must come BEFORE /:id to avoid "brands" being treated as an ObjectId
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { status: 'Published' });
    res.json({ success: true, data: brands.filter(Boolean).sort() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/products ── list with filters, search, pagination ───────────────
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      tags,
      sort    = '-createdAt',
      page    = 1,
      limit   = 20,
      status,
    } = req.query;

    const filter = {};

    if (category)             filter.category = category;
    if (brand)                filter.brand    = brand;
    if (status)               filter.status   = status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (tags) {
      const tagList = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagList };
    }

    if (search?.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Sanitize pagination
    const pageNum  = Math.max(1, Number(page)  || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 20));
    const skip     = (pageNum - 1) * limitNum;

    // Whitelist sort fields to prevent injection
    const allowedSorts = ['-createdAt', 'createdAt', 'price', '-price', '-rating', 'name', '-soldCount'];
    const safeSort = allowedSorts.includes(sort) ? sort : '-createdAt';

    const [products, total] = await Promise.all([
      Product.find(filter).sort(safeSort).skip(skip).limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.json({
      success:    true,
      data:       products,
      pagination: {
        total,
        page:  pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/products ── Admin only ─────────────────────────────────────────
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    // Required field check
    const { name, brand, category, price, stock, sku, image } = req.body;
    if (!name || !brand || !category || price === undefined || stock === undefined || !sku || !image) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, brand, category, price, stock, sku, image.',
      });
    }

    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data:    product,
      message: 'Product created successfully.',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A product with this SKU already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/products/:id ── Admin only ──────────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    // Prevent changing _id or internal fields
    const { _id, __v, ...updates } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product, message: 'Product updated successfully.' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'A product with this SKU already exists.' });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/products/:id ── Admin only ───────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/products/:id/stock ── Admin: update stock ────────────────────
router.patch('/:id/stock', protect, adminOnly, async (req, res) => {
  try {
    const { stock } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }

    if (stock === undefined || stock === null) {
      return res.status(400).json({ success: false, message: 'Stock value is required.' });
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ success: false, message: 'Stock must be a non-negative number.' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: stockNum },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: product, message: 'Stock updated successfully.' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
