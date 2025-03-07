import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isSameDay } from 'date-fns';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  Button,
  Drawer,
  AppBar,
  Toolbar,
  Avatar,
  Badge,
  ListItemButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ExitToApp as LogoutIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import '../styles/calendar.css';
import TaskForm from './TaskForm.tsx';
import { useNotifications } from '../contexts/NotificationContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { useCategories } from '../contexts/CategoryContext.tsx';
import { playComplete } from '../utils/sounds.ts';
import CategoryForm from './CategoryForm.tsx';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  reminders?: string[];
}

interface Category {
  _id: string;
  name: string;
  color?: string;
  userId: string;
  createdAt: string;
}

interface CalendarTile {
  date: Date;
  view: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskAnchorEl, setTaskAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { darkMode, toggleDarkMode } = useTheme();
  const { categories, loading: categoriesLoading, error: categoriesError, deleteCategory, refreshCategories } = useCategories();
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    // Get user info from localStorage and refresh data
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.name || 'User');
      refreshCategories(); // Refresh categories when user info is loaded
    } else {
      navigate('/login');
    }
  }, [navigate, refreshCategories]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, selectedDate, selectedCategory]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
      localStorage.setItem('tasks', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addNotification({
        message: 'Error fetching tasks',
        type: 'error',
      });
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Filter by date if selected
    if (selectedDate) {
      filtered = filtered.filter(task => 
        isSameDay(new Date(task.dueDate), selectedDate)
      );
    }

    // Filter by category if not 'all'
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    setFilteredTasks(filtered);
  };

  const handleTaskStatusChange = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (newStatus === 'completed') {
        playComplete();
      }

      addNotification({
        message: `Task marked as ${newStatus}`,
        type: 'success',
        playSound: true
      });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      addNotification({
        message: 'Error updating task status',
        type: 'error',
        playSound: true
      });
    }
  };

  const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    setTaskAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleTaskMenuClose = () => {
    setTaskAnchorEl(null);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
    handleTaskMenuClose();
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      addNotification({
        message: 'Task deleted successfully',
        type: 'success',
      });
      fetchTasks();
      handleTaskMenuClose();
    } catch (error) {
      console.error('Error deleting task:', error);
      addNotification({
        message: 'Error deleting task',
        type: 'error',
      });
    }
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (editingTask) {
        // Prepare update data
        const updatedTaskData = {
          ...taskData,
          status: editingTask.status // Preserve the existing status
        };
        
        // Make the update request
        const response = await axios.put(
          `http://localhost:5000/api/tasks/${editingTask._id}`,
          updatedTaskData,
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        if (response.data) {
          addNotification({
            message: 'Task updated successfully',
            type: 'success',
            playSound: true
          });
          await fetchTasks(); // Refresh the task list
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }
      } else {
        // Create new task
        const response = await axios.post(
          'http://localhost:5000/api/tasks',
          {
            ...taskData,
            status: 'pending'
          },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        if (response.data) {
          addNotification({
            message: 'Task created successfully',
            type: 'success',
            playSound: true
          });
          await fetchTasks(); // Refresh the task list
          setIsTaskFormOpen(false);
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      addNotification({
        message: error.response?.data?.message || 'Error saving task',
        type: 'error',
        playSound: true
      });
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const tileContent = ({ date }: { date: Date }) => {
    const tasksForDate = tasks.filter(task => 
      isSameDay(new Date(task.dueDate), date)
    );

    if (tasksForDate.length === 0) return null;

    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        mt: 1
      }}>
        <Badge
          badgeContent={tasksForDate.length}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.8rem',
              height: '20px',
              minWidth: '20px',
            }
          }}
        >
          <Box sx={{ width: 4, height: 4 }} />
        </Badge>
      </Box>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    refreshCategories(); // This will clear categories since there's no token
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: 'background.paper',
          height: '100vh',
          borderRight: '1px solid',
          borderColor: 'divider',
          position: 'fixed',
          left: 0,
          top: 0,
          boxShadow: 3,
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontWeight: 'bold',
            color: 'primary.main'
          }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main',
              background: 'linear-gradient(45deg, #6366f1, #f43f5e)'
            }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            Task Manager
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mt: 1, 
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            Welcome, {userName}
          </Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton selected>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <TaskIcon />
              </ListItemIcon>
              <ListItemText primary="My Tasks" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={toggleDarkMode}>
              <ListItemIcon>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </ListItemIcon>
              <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Log out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: '240px' }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsTaskFormOpen(true)}
                sx={{
                  background: 'linear-gradient(45deg, #6366f1, #f43f5e)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(99,102,241,0.4)',
                  }
                }}
              >
                New Task
              </Button>
            </Box>
          </Grid>

          {/* Tasks Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ 
              p: 3, 
              mb: 2, 
              borderRadius: 2,
              boxShadow: theme => `0 0 10px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Tasks</Typography>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    label="Category"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category.name}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <List>
                {filteredTasks.map((task) => (
                  <ListItem
                    key={task._id}
                    sx={{
                      mb: 1,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateX(5px)',
                        boxShadow: 2,
                      },
                    }}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        onClick={(e) => handleTaskMenuOpen(e, task)}
                        sx={{ color: 'primary.main' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={task.status === 'completed'}
                        onChange={() => handleTaskStatusChange(task._id)}
                        sx={{
                          color: 'primary.main',
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: 'primary.main'
                              }}
                            >
                              Due: {new Date(task.dueDate).toLocaleString()}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: task.priority === 'high' 
                                  ? '#f43f5e' 
                                  : task.priority === 'medium'
                                  ? '#f59e0b'
                                  : '#10b981',
                                fontWeight: 'bold',
                                bgcolor: task.priority === 'high'
                                  ? 'rgba(244, 63, 94, 0.1)'
                                  : task.priority === 'medium'
                                  ? 'rgba(245, 158, 11, 0.1)'
                                  : 'rgba(16, 185, 129, 0.1)',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1
                              }}
                            >
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </Typography>
                            {task.reminders && task.reminders.length > 0 && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: 'secondary.main'
                                }}
                              >
                                {task.reminders.length} Reminder{task.reminders.length > 1 ? 's' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Calendar Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              mb: 2, 
              borderRadius: 2,
              boxShadow: theme => `0 0 10px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Calendar</Typography>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setSelectedDate(value);
                  }
                }}
                value={selectedDate}
                tileContent={tileContent}
                className="custom-calendar"
              />
            </Paper>
            <Paper sx={{ 
              p: 3,
              borderRadius: 2,
              boxShadow: theme => `0 0 10px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Categories</Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryFormOpen(true);
                  }}
                  size="small"
                >
                  New Category
                </Button>
              </Box>
              <List>
                {categories.map((category) => {
                  const categoryTasks = tasks.filter(task => task.category === category.name);
                  return (
                    <ListItem 
                      key={category._id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: selectedCategory === category.name ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      secondaryAction={
                        <Box>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCategory(category);
                              setIsCategoryFormOpen(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(category._id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                      onClick={() => handleCategoryChange(category.name)}
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: category.color || '#6366f1',
                          mr: 2
                        }}
                      />
                      <ListItemText
                        primary={category.name}
                        secondary={`${categoryTasks.length} task${categoryTasks.length !== 1 ? 's' : ''}`}
                      />
                      <Badge 
                        badgeContent={categoryTasks.length} 
                        color="primary"
                        sx={{
                          marginRight: 8,
                          '& .MuiBadge-badge': {
                            background: 'linear-gradient(45deg, #6366f1, #f43f5e)',
                          },
                        }}
                      />
                    </ListItem>
                  );
                })}
                {categories.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 2 }}
                  >
                    No categories yet. Create one to organize your tasks!
                  </Typography>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Task Menu */}
      <Menu
        anchorEl={taskAnchorEl}
        open={Boolean(taskAnchorEl)}
        onClose={handleTaskMenuClose}
      >
        <MenuItem onClick={() => selectedTask && handleEditTask(selectedTask)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={() => selectedTask && handleDeleteTask(selectedTask._id)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Task Form Dialog */}
      <TaskForm
        open={isTaskFormOpen}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        editTask={editingTask}
      />

      {/* Category Form Dialog */}
      <CategoryForm
        open={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false);
          setEditingCategory(null);
        }}
        editCategory={editingCategory}
      />
    </Box>
  );
};

export default Dashboard;
