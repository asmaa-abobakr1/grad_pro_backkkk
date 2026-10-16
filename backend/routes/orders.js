import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// ─── POST /api/orders ── Place a new order (guest or authenticated) ────────────
router.post('/', optionalAuth, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      address,
      items,
      promoCode,
      subtotal,
      discount,
      tax,
      shipping,
      total,
    } = req.body;

    // ── Validation ──────────────────────────────────────────────────────────────
    if (!customerName?.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required.' });
    }
    if (!customerEmail?.trim() || !/^\S+@\S+\.\S+$/.test(customerEmail)) {
      return res.status(400).json({ success: false, message: 'A valid customer email is required.' });
    }
    if (!address?.trim()) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }
    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ success: false, message: 'Order total must be a positive number.' });
    }

    // ── Build order items & update stock ─────────────────────────────────────
    const orderItems = [];

    for (const item of items) {
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ success: false, message: 'Each item must have a quantity of at least 1.' });
      }

      let product = null;
      const pid = item.productId || item._id || item.id;

      if (pid && mongoose.Types.ObjectId.isValid(pid)) {
        product = await Product.findById(pid);
      }

      if (product) {
        if (product.status !== 'Published') {
          return res.status(400).json({ success: false, message: `Product "${product.name}" is no longer available.` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}.`,
          });
        }
        // Atomic stock decrement
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity, soldCount: item.quantity },
        });
      }

      orderItems.push({
        product: product ? product._id : null,
        productName:  item.productName  || item.name  || (product ? product.name  : 'Device'),
        productImage: item.productImage || item.image || (product ? product.image : ''),
        price:    item.price    || (product ? product.price : 0),
        quantity: item.quantity,
      });
    }

    // ── Create order ─────────────────────────────────────────────────────────
    const order = await Order.create({
      customer:      req.user?._id || null,
      customerName:  customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      address:       address.trim(),
      items:         orderItems,
      promoCode:     promoCode || '',
      subtotal:      subtotal  || 0,
      discount:      discount  || 0,
      tax:           tax       || 0,
      shipping:      shipping  || 0,
      total,
    });

    res.status(201).json({
      success: true,
      data:    order,
      message: 'Order placed successfully!',
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/orders/my ── Current user's orders ──────────────────────────────
// IMPORTANT: this route MUST come before /:id so Express doesn't treat "my" as an ID
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/orders ── Admin: list all orders ────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (status && status !== 'all') filter.status = status;

    if (search?.trim()) {
      const esc = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { orderId:       { $regex: esc, $options: 'i' } },
        { customerName:  { $regex: esc, $options: 'i' } },
        { customerEmail: { $regex: esc, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customer', 'name email avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      success:    true,
      data:       orders,
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

// ─── GET /api/orders/:id ─────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Non-admin users can only view their own orders
    if (req.user.role !== 'admin' && order.customer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/orders/:id/status ── Admin: update order status ─────────────────
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'Refunded'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order, message: `Order status updated to "${status}".` });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
