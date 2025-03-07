import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Icon,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useNotifications } from '../contexts/NotificationContext.tsx';
import { useCategories } from '../contexts/CategoryContext.tsx';
import { addHours, addMinutes } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  editTask?: any;
}

const TaskForm: React.FC<TaskFormProps> = ({ open, onClose, onSubmit, editTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(addHours(new Date(), 1));
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [reminders, setReminders] = useState<Date[]>([]);
  const [newReminderTime, setNewReminderTime] = useState<Date | null>(null);
  const { addNotification } = useNotifications();
  const { categories, addCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate) : null);
      setCategory(editTask.category || '');
      setPriority(editTask.priority || 'medium');
      setReminders(editTask.reminders?.map((r: any) => 
        typeof r === 'string' ? new Date(r) : new Date(r.time)
      ) || []);
    } else {
      resetForm();
    }
  }, [editTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) {
      addNotification({
        message: 'Please select a due date',
        type: 'error',
        playSound: true
      });
      return;
    }

    if (dueDate < new Date()) {
      addNotification({
        message: 'Due date cannot be in the past',
        type: 'error',
        playSound: true
      });
      return;
    }

    const sortedReminders = [...reminders].sort((a, b) => a.getTime() - b.getTime());

    const formattedData = {
      title,
      description,
      dueDate: dueDate.toISOString(),
      category,
      priority,
      reminders: sortedReminders.map(r => r.toISOString()),
      ...(editTask && { status: editTask.status }), // Preserve status when editing
    };

    onSubmit(formattedData);
    handleClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(addHours(new Date(), 1));
    setCategory('');
    setPriority('medium');
    setReminders([]);
    setNewReminderTime(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddReminder = () => {
    if (newReminderTime && dueDate) {
      if (newReminderTime >= dueDate) {
        addNotification({
          message: 'Reminder time must be before the due date',
          type: 'error',
          playSound: true
        });
        return;
      }
      if (newReminderTime < new Date()) {
        addNotification({
          message: 'Reminder time cannot be in the past',
          type: 'error',
          playSound: true
        });
        return;
      }
      setReminders([...reminders, newReminderTime]);
      setNewReminderTime(null);
    }
  };

  const handleRemoveReminder = (index: number) => {
    setReminders(reminders.filter((_, i) => i !== index));
  };

  const addQuickReminder = (minutes: number) => {
    if (dueDate) {
      const reminderTime = addMinutes(new Date(), minutes);
      if (reminderTime >= dueDate) {
        addNotification({
          message: 'Quick reminder time must be before the due date',
          type: 'error',
          playSound: true
        });
        return;
      }
      setReminders([...reminders, reminderTime]);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              autoFocus
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date & Time"
                value={dueDate}
                onChange={(newValue) => setDueDate(newValue)}
                disablePast
              />
            </LocalizationProvider>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label="Category"
                required
              >
                {categories.map((cat) => (
                  <MenuItem 
                    key={cat._id} 
                    value={cat.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Icon sx={{ color: cat.color }}>{cat.icon}</Icon>
                      <Box>
                        <Typography variant="body1">{cat.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cat.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="New Category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={async () => {
                  if (newCategoryName.trim()) {
                    try {
                      await addCategory(newCategoryName, '#6366f1');
                      setCategory(newCategoryName);
                      setNewCategoryName('');
                      addNotification({
                        message: 'Category added successfully',
                        type: 'success',
                      });
                    } catch (error: any) {
                      addNotification({
                        message: error.response?.data?.message || 'Error adding category',
                        type: 'error',
                      });
                    }
                  }
                }}
              >
                Add Category
              </Button>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value)}
                required
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1">Quick Reminders</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button variant="outlined" onClick={() => addQuickReminder(30)}>30min</Button>
                <Button variant="outlined" onClick={() => addQuickReminder(60)}>1h</Button>
                <Button variant="outlined" onClick={() => addQuickReminder(120)}>2h</Button>
                <Button variant="outlined" onClick={() => addQuickReminder(180)}>3h</Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1">Custom Reminder</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Reminder Time"
                    value={newReminderTime}
                    onChange={(newValue) => setNewReminderTime(newValue)}
                    disablePast
                  />
                </LocalizationProvider>
                <IconButton onClick={handleAddReminder} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            {reminders.length > 0 && (
              <List>
                <Typography variant="subtitle1">Set Reminders</Typography>
                {reminders.map((reminder, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={reminder.toLocaleString()}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveReminder(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {editTask ? 'Update' : 'Add'} Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskForm; 