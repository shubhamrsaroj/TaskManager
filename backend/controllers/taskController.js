import Task from '../models/Task.js';

// Get all tasks for a user with optional priority filter
export const getTasks = async (req, res) => {
  try {
    const { priority, sortBy } = req.query;
    let query = { userId: req.user._id };
    let sort = { dueDate: 1 };

    // Add priority filter if specified
    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      query.priority = priority;
    }

    // Add sorting options
    if (sortBy === 'priority') {
      // Custom priority sorting (high -> medium -> low)
      sort = {
        priority: -1, // This will be handled in memory since it's an enum
        dueDate: 1
      };
    }

    const tasks = await Task.find(query).sort(sort);

    // If sorting by priority, manually sort since MongoDB doesn't know our priority order
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      tasks.sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff === 0) {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return priorityDiff;
      });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by date
export const getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      userId: req.user._id,
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, category, priority, reminders } = req.body;
    
    // Validate required fields
    if (!title || !dueDate || !category) {
      return res.status(400).json({ 
        message: 'Title, due date, and category are required' 
      });
    }

    // Validate priority
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        message: 'Priority must be high, medium, or low'
      });
    }

    const reminderTimes = reminders ? reminders.map(time => ({
      time: new Date(time),
      sent: false
    })) : [];

    const task = new Task({
      title,
      description,
      dueDate: new Date(dueDate),
      category,
      priority: priority || 'medium',
      userId: req.user._id,
      reminders: reminderTimes,
      status: 'pending',
      notificationSent: false
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Validate the task exists
    const existingTask = await Task.findOne({ _id: id, userId: req.user._id });
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Validate priority if it's being updated
    if (updates.priority && !['high', 'medium', 'low'].includes(updates.priority)) {
      return res.status(400).json({
        message: 'Priority must be high, medium, or low'
      });
    }

    // Format reminders if they exist
    if (updates.reminders) {
      updates.reminders = updates.reminders.map(time => ({
        time: new Date(time),
        sent: false
      }));
    }

    // Format dueDate if it exists
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }

    // Prepare update data
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle status changes
    if (updates.status === 'completed') {
      // When task is marked as completed
      updateData.notificationSent = true;
      updateData.reminders = existingTask.reminders.map(r => ({
        ...r,
        sent: true
      }));
    } else if (updates.status === 'pending' && existingTask.status === 'completed') {
      // When task is marked as uncompleted (from completed)
      updateData.notificationSent = false;
      updateData.reminders = existingTask.reminders.map(r => ({
        ...r,
        sent: false
      }));
    }

    // Update the task
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by category
export const getTasksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const tasks = await Task.find({
      userId: req.user._id,
      category
    }).sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tasks by priority
export const getTasksByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    
    if (!['high', 'medium', 'low'].includes(priority)) {
      return res.status(400).json({
        message: 'Invalid priority level'
      });
    }

    const tasks = await Task.find({
      userId: req.user._id,
      priority
    }).sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check for due tasks and send notifications
export const checkDueTasks = async () => {
  try {
    const now = new Date();
    const tasks = await Task.find({
      status: 'pending',
      $or: [
        {
          dueDate: { $lte: now },
          notificationSent: false
        },
        {
          'reminders.time': { $lte: now },
          'reminders.sent': false
        }
      ]
    });

    const notifications = [];
    
    for (const task of tasks) {
      // Check main due date
      if (task.dueDate <= now && !task.notificationSent) {
        notifications.push({
          taskId: task._id,
          userId: task.userId,
          message: `Task "${task.title}" is due now!`,
          type: 'due'
        });
        task.notificationSent = true;
      }

      // Check reminders
      task.reminders = task.reminders.map(reminder => {
        if (reminder.time <= now && !reminder.sent) {
          notifications.push({
            taskId: task._id,
            userId: task.userId,
            message: `Reminder: Task "${task.title}" is due in ${getTimeRemaining(task.dueDate)}`,
            type: 'reminder'
          });
          reminder.sent = true;
        }
        return reminder;
      });

      await task.save();
    }

    return notifications;
  } catch (error) {
    console.error('Error checking due tasks:', error);
    return [];
  }
};

function getTimeRemaining(dueDate) {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} minutes`;
  } else if (hours < 24) {
    return `${hours} hours`;
  } else {
    const days = Math.floor(hours / 24);
    return `${days} days`;
  }
} 