import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Sparkles', // Lucide icon name
    },
    color: {
      type: String,
      default: '#2563EB',
    },
    desc: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Virtual: product count ──────────────────────────────────────────────────
categorySchema.virtual('count', {
  ref: 'Product',
  localField: 'name',
  foreignField: 'category',
  count: true,
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
