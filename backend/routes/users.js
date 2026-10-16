import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ══════════════════════════════════════════════════════════════════════════════
//  /me routes — MUST be before /:id
// ══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/users/me/wishlist ── Get populated wishlist ─────────────────────
router.get('/me/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    const cleanWishlist = (user.wishlist || []).filter(p => p != null);
    res.json({ success: true, wishlist: cleanWishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/me/wishlist/:productId ── Toggle one wishlist item ─────────
router.put('/me/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const pid = new mongoose.Types.ObjectId(productId);
    const idx = user.wishlist.findIndex((id) => id.equals(pid));
    const added = idx === -1;

    if (idx > -1) user.wishlist.splice(idx, 1);  // remove
    else          user.wishlist.push(pid);         // add

    await user.save();

    // Return only IDs (no populate needed — frontend manages its own state)
    res.json({
      success: true,
      added,
      wishlistIds: user.wishlist.map(id => id.toString()),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/me/cart ── Get current user's populated cart ───────────────
router.get('/me/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    res.json({ success: true, cart: user.cart || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/me/cart ── Replace entire cart (full sync) ────────────────
router.put('/me/cart', protect, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity, price }]
    if (!Array.isArray(items))
      return res.status(400).json({ success: false, message: 'items must be an array.' });

    const cartItems = items
      .filter((i) => i.productId && mongoose.Types.ObjectId.isValid(i.productId) && i.quantity >= 1)
      .map((i) => ({
        product:  new mongoose.Types.ObjectId(i.productId),
        quantity: Math.max(1, Math.floor(Number(i.quantity))),
        price:    Number(i.price) || 0,
      }));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { cart: cartItems },
      { new: true }
    ).populate('cart.product');

    res.json({ success: true, cart: user.cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/users/me/cart ── Clear entire cart ──────────────────────────
router.delete('/me/cart', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { cart: [] });
    res.json({ success: true, cart: [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/me/settings ── Get store settings ─────────────────────────
router.get('/me/settings', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('storeSettings');
    res.json({ success: true, settings: user.storeSettings || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/me/settings ── Save store settings (admin only) ───────────
router.put('/me/settings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Admin only.' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { storeSettings: req.body },
      { new: true }
    ).select('storeSettings');

    res.json({ success: true, settings: user.storeSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── LEGACY: PUT /api/users/wishlist/:productId (kept for backward compat) ────
router.put('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId))
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });

    const user = await User.findById(req.user._id);
    const pid  = new mongoose.Types.ObjectId(productId);
    const idx  = user.wishlist.findIndex((id) => id.equals(pid));
    if (idx > -1) user.wishlist.splice(idx, 1);
    else          user.wishlist.push(pid);
    await user.save();

    const populated = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, wishlist: populated.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
//  Admin CRUD
// ══════════════════════════════════════════════════════════════════════════════

// ─── GET /api/users ── Admin: list all users ─────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (role && ['customer', 'admin'].includes(role)) filter.role = role;
    if (search?.trim()) {
      const esc = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name:  { $regex: esc, $options: 'i' } },
        { email: { $regex: esc, $options: 'i' } },
      ];
    }
    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip((pageNum - 1) * limitNum).limit(limitNum),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/:id ── Admin: update user ─────────────────────────────────
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });

    const { role, isActive, name } = req.body;
    const updates = {};
    if (role !== undefined) {
      if (!['customer', 'admin'].includes(role))
        return res.status(400).json({ success: false, message: 'Invalid role.' });
      updates.role = role;
    }
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    if (name?.trim())           updates.name = name.trim();

    if (Object.keys(updates).length === 0)
      return res.status(400).json({ success: false, message: 'No valid fields provided.' });

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
