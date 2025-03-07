import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    immutable: true // Prevent userId from being changed after creation
  },
  icon: {
    type: String,
    enum: ['bookmark', 'star', 'flag', 'label', 'folder'],
    default: 'bookmark'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  }
}, {
  timestamps: true
});

// Ensure only one default category per user
categorySchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Prevent any operations that might affect other users' categories
categorySchema.pre(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], async function(next) {
  // Ensure userId is always part of the query
  if (!this._conditions.userId) {
    throw new Error('UserId is required for all category operations');
  }
  next();
});

// Update other categories when setting a new default
categorySchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  // Prevent updating userId
  if (update.$set && update.$set.userId) {
    delete update.$set.userId;
  }
  if (update.userId) {
    delete update.userId;
  }

  if (update.$set && update.$set.isDefault === true) {
    const userId = this._conditions.userId;
    await this.model.updateMany(
      { userId, _id: { $ne: this._conditions._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Add compound index to ensure unique category names per user
categorySchema.index({ name: 1, userId: 1 }, { 
  unique: true,
  background: true
});

// Add index on userId for better query performance
categorySchema.index({ userId: 1 }, { background: true });

// Static method to find categories by user
categorySchema.statics.findByUser = function(userId) {
  if (!userId) {
    throw new Error('UserId is required');
  }
  return this.find({ userId: userId.toString() });
};

// Instance method to check if a user owns this category
categorySchema.methods.belongsToUser = function(userId) {
  return this.userId.toString() === userId.toString();
};

const Category = mongoose.model('Category', categorySchema);

export default Category;