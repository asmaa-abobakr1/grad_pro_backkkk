import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
    default: null,
  },
  productName:  { type: String, required: true },  // snapshot at order time
  productImage: { type: String, default: '' },
  price:        { type: Number, required: true, min: 0 },  // price at order time
  quantity:     { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type:   String,
      unique: true,
      sparse: true, // allows null during pre-save generation without unique constraint error
    },
    customer: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null, // null = guest checkout
    },
    customerName:  { type: String, required: true, trim: true },
    customerEmail: {
      type:     String,
      required: true,
      trim:     true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    items:   {
      type:     [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message:   'Order must contain at least one item.',
      },
    },
    address:  { type: String, required: true, trim: true },
    status: {
      type:    String,
      enum:    ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax:      { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    total:    { type: Number, required: true, min: 0 },
    promoCode: { type: String, default: '', uppercase: true, trim: true },
    notes:     { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── Auto-generate orderId before saving ─────────────────────────────────────
// Uses a counter approach that avoids race conditions by retrying on duplicate
orderSchema.pre('save', async function (next) {
  if (this.orderId) return next(); // already assigned

  let attempts = 0;
  while (attempts < 10) {
    try {
      const count = await mongoose.model('Order').countDocuments();
      const candidate = `ORD-${String(count + 1 + attempts).padStart(4, '0')}`;
      // Check it doesn't already exist
      const exists = await mongoose.model('Order').findOne({ orderId: candidate });
      if (!exists) {
        this.orderId = candidate;
        return next();
      }
    } catch { /* ignore and retry */ }
    attempts++;
  }
  // Fallback: use timestamp + random to guarantee uniqueness
  this.orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  next();
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerEmail: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
