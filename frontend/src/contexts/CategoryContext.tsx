import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNotifications } from './NotificationContext.tsx';
import { DEFAULT_CATEGORIES } from '../constants/defaultCategories.ts';

// Define interfaces first
interface Category {
  _id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  icon?: string;
  isDefault?: boolean;
  description?: string;
  priority?: number;
}

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (name: string, color: string, options?: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateCategory: (categoryId: string, name: string, color: string, options?: Partial<Category>) => Promise<void>;
  refreshCategories: () => Promise<void>;
  initializeDefaultCategories: () => Promise<void>;
}

// Create context with a default value
const CategoryContext = createContext<CategoryContextType>({
  categories: [],
  loading: false,
  error: null,
  addCategory: async () => {},
  deleteCategory: async () => {},
  updateCategory: async () => {},
  refreshCategories: async () => {},
  initializeDefaultCategories: async () => {}
});

// Create the provider component
const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const initializeDefaultCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);
      
      // Add each default category
      for (const category of DEFAULT_CATEGORIES) {
        try {
          await axios.post(
            'http://localhost:5000/api/categories',
            category,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err: any) {
          // If category already exists, skip it
          if (err.response?.status !== 409) {
            console.error(`Error adding default category ${category.name}:`, err);
          }
        }
      }

      // Refresh categories after adding defaults
      await fetchCategories();
      
      addNotification({
        message: 'Default categories initialized',
        type: 'success'
      });
    } catch (err: any) {
      setError('Error initializing default categories');
      addNotification({
        message: 'Error initializing default categories',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user?._id) {
        setCategories([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/categories/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const categoriesWithColors = response.data.map((cat: any) => ({
        ...cat,
        color: cat.color || '#6366f1'
      }));
      
      setCategories(categoriesWithColors);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching categories');
      addNotification({
        message: 'Error fetching categories',
        type: 'error'
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        fetchCategories();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    fetchCategories();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addCategory = async (name: string, color: string, options?: Partial<Category>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.post(
        'http://localhost:5000/api/categories',
        { name, color, ...options },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories(prev => [...prev, { ...response.data, color: color || '#6366f1' }]);
      addNotification({
        message: 'Category created successfully',
        type: 'success',
        playSound: true
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error creating category';
      setError(errorMessage);
      addNotification({
        message: errorMessage,
        type: 'error',
        playSound: true
      });
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      setCategories(prev => prev.filter(category => category._id !== categoryId));

      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addNotification({
        message: 'Category deleted successfully',
        type: 'success',
        playSound: true
      });
    } catch (err: any) {
      fetchCategories();
      const errorMessage = err.response?.data?.message || 'Error deleting category';
      setError(errorMessage);
      addNotification({
        message: errorMessage,
        type: 'error',
        playSound: true
      });
      throw err;
    }
  };

  const updateCategory = async (categoryId: string, name: string, color: string, options?: Partial<Category>) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token');

      const response = await axios.put(
        `http://localhost:5000/api/categories/${categoryId}`,
        { name, color, ...options },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories(prev => 
        prev.map(category => 
          category._id === categoryId ? { ...response.data, color: color || '#6366f1' } : category
        )
      );

      addNotification({
        message: 'Category updated successfully',
        type: 'success',
        playSound: true
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error updating category';
      setError(errorMessage);
      addNotification({
        message: errorMessage,
        type: 'error',
        playSound: true
      });
      throw err;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        addCategory,
        deleteCategory,
        updateCategory,
        refreshCategories: fetchCategories,
        initializeDefaultCategories
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// Export the hook after the context is created
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export { CategoryProvider };
export default CategoryContext;