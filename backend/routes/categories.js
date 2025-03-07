import express from 'express';
import { auth } from '../middleware/auth.js';
import Category from '../models/Category.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get all categories for the authenticated user
router.get('/', async (req, res) => {
  try {
    // Ensure we only get categories for the current user
    const categories = await Category.find({ 
      userId: req.user._id.toString() 
    }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get categories for specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Ensure user can only access their own categories
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const categories = await Category.find({ userId: req.params.userId });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    // Explicitly set the userId to the current user's ID
    const category = new Category({
      ...req.body,
      userId: req.user._id.toString()
    });
    
    // Check if category with same name exists for this user
    const existingCategory = await Category.findOne({
      name: req.body.name,
      userId: req.user._id.toString()
    });

    if (existingCategory) {
      return res.status(400).json({ 
        message: 'Category with this name already exists for your account' 
      });
    }

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    // First check if the category exists and belongs to the user
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id.toString()
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found or access denied' });
    }

    // Check if update would create a duplicate name
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: req.body.name,
        userId: req.user._id.toString(),
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({ 
          message: 'Category with this name already exists for your account' 
        });
      }
    }

    // Update the category
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id.toString() },
      { ...req.body },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found or access denied' });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    // Find and delete the category only if it belongs to the user
    const deletedCategory = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id.toString()
    });
    
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found or access denied' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

export default router; 