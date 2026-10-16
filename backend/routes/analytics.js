import express from 'express';
import Order   from '../models/Order.js';
import Product from '../models/Product.js';
import User    from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// ─── GET /api/analytics/dashboard ── Admin: overview stats ───────────────────
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueAgg,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer', isActive: true }),
      Product.countDocuments({ status: 'Published' }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $nin: ['Cancelled', 'Refunded'] } } },
        { $group: { _id: null, total: { $sum: '$total' }, orders: { $sum: 1 } } },
      ]),
      Order.find()
        .sort('-createdAt')
        .limit(8)
        .populate('customer', 'name email')
        .lean(),
      Product.find({ status: 'Published', stock: { $gt: 0, $lte: 8 } })
        .select('name stock sku')
        .limit(10)
        .lean(),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    const dailyOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const conversionRate =
      totalOrders > 0 && totalUsers > 0
        ? ((totalOrders / totalUsers) * 100).toFixed(2)
        : '0.00';

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalUsers,
        totalProducts,
        totalOrders,
        dailyOrders,
        conversionRate,
        recentOrders,
        lowStockProducts,
      },
    });
  } catch (err) {
    console.error('Analytics dashboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/analytics/monthly-sales ────────────────────────────────────────
router.get('/monthly-sales', protect, adminOnly, async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    if (year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Invalid year.' });
    }

    const monthly = await Order.aggregate([
      {
        $match: {
          status:    { $nin: ['Cancelled', 'Refunded'] },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lt:  new Date(`${year + 1}-01-01T00:00:00.000Z`),
          },
        },
      },
      {
        $group: {
          _id:     { $month: '$createdAt' },
          revenue: { $sum: '$total' },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const data   = MONTHS.map((month, i) => {
      const found = monthly.find((m) => m._id === i + 1);
      return {
        month,
        revenue: Math.round(found?.revenue || 0),
        orders:  found?.orders  || 0,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/analytics/category-breakdown ────────────────────────────────────
router.get('/category-breakdown', protect, adminOnly, async (req, res) => {
  try {
    const breakdown = await Order.aggregate([
      { $match: { status: { $nin: ['Cancelled', 'Refunded'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from:         'products',
          localField:   'items.product',
          foreignField: '_id',
          as:           'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmpty: false } },
      {
        $group: {
          _id:     '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units:   { $sum: '$items.quantity' },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { revenue: -1 } },
    ]);

    const COLORS = ['#2563eb','#4f46e5','#0ea5e9','#10b981','#f59e0b','#ec4899','#6366f1'];
    const total  = breakdown.reduce((sum, b) => sum + b.revenue, 0);

    const data = breakdown.map((b, i) => ({
      name:    b._id,
      revenue: Math.round(b.revenue),
      units:   b.units,
      value:   total > 0 ? Math.round((b.revenue / total) * 100) : 0,
      color:   COLORS[i % COLORS.length],
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/analytics/top-products ─────────────────────────────────────────
router.get('/top-products', protect, adminOnly, async (req, res) => {
  try {
    const topProducts = await Product.find({ status: 'Published' })
      .sort('-soldCount')
      .limit(10)
      .select('name soldCount price category')
      .lean();

    const data = topProducts.map((p) => ({
      name:     p.name,
      category: p.category,
      sales:    p.soldCount || 0,
      revenue:  Math.round((p.soldCount || 0) * p.price),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
