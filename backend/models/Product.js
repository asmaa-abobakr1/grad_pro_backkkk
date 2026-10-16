import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    status: {
      type: String,
      enum: ['Published', 'Draft', 'Archived'],
      default: 'Draft',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Main image URL (Cloudinary or any URL)
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    // Additional images
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Dynamic specs object: { Processor: 'M3', RAM: '16GB', ... }
    specs: {
      type: Map,
      of: String,
      default: {},
    },
    highlights: {
      type: [String],
      default: [],
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    // Number of times this product was sold
    soldCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // Convert Map to plain object when converting to JSON
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Convert specs Map → plain object
        if (ret.specs instanceof Map) {
          ret.specs = Object.fromEntries(ret.specs);
        }
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });

// ─── Virtual: discount percentage ─────────────────────────────────────────────
productSchema.virtual('discountPct').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

const Product = mongoose.model('Product', productSchema);
export default Product;
