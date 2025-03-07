import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';

interface AuthRequest extends Request {
  user?: any;
}

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user._id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: 'Error creating task' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const match: any = { userId: req.user._id };
    const sort: any = {};

    if (req.query.status) {
      match.status = req.query.status;
    }

    if (req.query.category) {
      match.category = req.query.category;
    }

    if (req.query.sortBy) {
      const parts = (req.query.sortBy as string).split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const tasks = await Task.find(match)
      .sort(sort)
      .limit(parseInt(req.query.limit as string) || 10)
      .skip(parseInt(req.query.skip as string) || 0);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching task' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'status', 'dueDate', 'category', 'reminders', 'priority'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Handle reminders specially
    if (req.body.reminders) {
      task.reminders = req.body.reminders.map((time: string) => ({
        time: new Date(time),
        sent: false
      }));
      delete req.body.reminders;
    }

    // Update other fields
    updates.forEach((update) => {
      if (update !== 'reminders') {
        (task as any)[update] = req.body[update];
      }
    });

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: 'Error updating task' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting task' });
  }
}; 