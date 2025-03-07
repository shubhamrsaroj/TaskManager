import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { playNotification, handleUserInteraction } from '../utils/sounds.ts';
import axios from 'axios';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  playSound?: boolean;
  date?: Date;
}

interface NotificationContextType {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
  checkDueDates: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  // Initialize sound playback on mount
  useEffect(() => {
    handleUserInteraction();
  }, []);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    if (!isAuthenticated()) return;
    
    console.log('Adding notification:', notification); // Debug log
    
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setNotifications(prev => [...prev, newNotification]);
    if (notification.playSound) {
      playNotification().catch(error => {
        console.warn('Error playing notification sound:', error);
      });
    }
  };

  const removeNotification = (id: string) => {
    console.log('Removing notification:', id); // Debug log
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const checkDueDates = async () => {
    if (!isAuthenticated()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // Fetch fresh tasks data from server
      const response = await axios.get('http://localhost:5000/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasks = response.data;
      
      const now = new Date();
      
      tasks.forEach((task: any) => {
        if (task.status === 'completed') return;

        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        // Show warning for tasks due within 24 hours
        if (hoursDiff > 0 && hoursDiff <= 24 && !task.notified) {
          addNotification({
            message: `Task "${task.title}" is due in ${Math.round(hoursDiff)} hours!`,
            type: 'warning',
            date: dueDate,
            playSound: true,
          });
          task.notified = true;
        }

        // Show alert for overdue tasks
        if (hoursDiff < 0 && !task.notificationSent) {
          addNotification({
            message: `Task "${task.title}" is overdue!`,
            type: 'error',
            date: dueDate,
            playSound: true,
          });
          task.notificationSent = true;
        }

        // Check reminders
        if (task.reminders && Array.isArray(task.reminders)) {
          task.reminders.forEach((reminder: any) => {
            if (!reminder.sent) {
              const reminderTime = new Date(reminder.time);
              const reminderDiff = reminderTime.getTime() - now.getTime();
              const reminderMinutesDiff = reminderDiff / (1000 * 60);

              // Show reminder notification if within 5 minutes of reminder time
              if (reminderMinutesDiff >= 0 && reminderMinutesDiff <= 5) {
                addNotification({
                  message: `Reminder: Task "${task.title}" is due in ${Math.round(hoursDiff)} hours!`,
                  type: 'info',
                  date: dueDate,
                  playSound: true,
                });
              }
            }
          });
        }
      });

      // Update tasks in localStorage with notification states
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error checking due dates:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) return;

    // Check for due dates every minute
    const interval = setInterval(checkDueDates, 60000);
    checkDueDates(); // Check immediately on mount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('Current notifications:', notifications); // Debug log
    if (notifications.length > 0 && !currentNotification) {
      setCurrentNotification(notifications[0]);
      setOpen(true);
    }
  }, [notifications]);

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setTimeout(() => {
      if (currentNotification) {
        removeNotification(currentNotification.id);
        setCurrentNotification(null);
      }
    }, 300);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        checkDueDates
      }}
    >
      {children}
      {isAuthenticated() && (
        <Snackbar
          open={open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            marginTop: '20px',
            '& .MuiAlert-root': {
              width: '100%',
              minWidth: '300px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={currentNotification?.type || 'info'}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {currentNotification?.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}; 