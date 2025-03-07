import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getTasks,
  getTasksByDate,
  getTasksByCategory,
  getTasksByPriority,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// Get all tasks (with optional priority filter via query params)
router.get('/', auth, getTasks);

// Get tasks by date
router.get('/date/:date', auth, getTasksByDate);

// Get tasks by category
router.get('/category/:category', auth, getTasksByCategory);

// Get tasks by priority
router.get('/priority/:priority', auth, getTasksByPriority);

// Create a new task
router.post('/', auth, createTask);

// Update a task
router.put('/:id', auth, updateTask);
router.patch('/:id', auth, updateTask);

// Delete a task
router.delete('/:id', auth, deleteTask);

export default router; 