import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
} from '@mui/material';
import { MuiColorInput } from 'mui-color-input';
import { useCategories } from '../contexts/CategoryContext.tsx';
import {
  Bookmark,
  BookmarkBorder,
  Star,
  StarBorder,
  Flag,
  FlagOutlined,
  Label,
  LabelOutlined,
  Folder,
  FolderOutlined,
} from '@mui/icons-material';

interface CategoryFormProps {
  open: boolean;
  onClose: () => void;
  editCategory?: {
    _id: string;
    name: string;
    color: string;
    icon?: string;
    isDefault?: boolean;
    description?: string;
    priority?: number;
  } | null;
}

const ICONS = [
  { name: 'bookmark', filled: <Bookmark />, outlined: <BookmarkBorder /> },
  { name: 'star', filled: <Star />, outlined: <StarBorder /> },
  { name: 'flag', filled: <Flag />, outlined: <FlagOutlined /> },
  { name: 'label', filled: <Label />, outlined: <LabelOutlined /> },
  { name: 'folder', filled: <Folder />, outlined: <FolderOutlined /> },
];

const PRIORITY_LEVELS = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
];

const CategoryForm: React.FC<CategoryFormProps> = ({ open, onClose, editCategory }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('bookmark');
  const [isDefault, setIsDefault] = useState(false);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const { addCategory, updateCategory } = useCategories();

  useEffect(() => {
    if (editCategory) {
      setName(editCategory.name);
      setColor(editCategory.color);
      setIcon(editCategory.icon || 'bookmark');
      setIsDefault(editCategory.isDefault || false);
      setDescription(editCategory.description || '');
      setPriority(editCategory.priority || 1);
    } else {
      resetForm();
    }
  }, [editCategory]);

  const resetForm = () => {
    setName('');
    setColor('#6366f1');
    setIcon('bookmark');
    setIsDefault(false);
    setDescription('');
    setPriority(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const categoryData = {
        name,
        color,
        icon,
        isDefault,
        description,
        priority,
      };

      if (editCategory) {
        await updateCategory(editCategory._id, name, color, categoryData);
      } else {
        await addCategory(name, color, categoryData);
      }
      handleClose();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {React.cloneElement(
            ICONS.find(i => i.name === icon)?.filled || <Bookmark />,
            { style: { color } }
          )}
          <Typography>{editCategory ? 'Edit Category' : 'Add New Category'}</Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={2}
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <MuiColorInput
                label="Category Color"
                value={color}
                onChange={(newColor) => setColor(newColor)}
                format="hex"
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(Number(e.target.value))}
                >
                  {PRIORITY_LEVELS.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      {level.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Icon</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {ICONS.map((iconOption) => (
                  <Tooltip key={iconOption.name} title={iconOption.name}>
                    <IconButton
                      onClick={() => setIcon(iconOption.name)}
                      sx={{
                        color: icon === iconOption.name ? color : 'inherit',
                        bgcolor: icon === iconOption.name ? `${color}15` : 'transparent',
                      }}
                    >
                      {icon === iconOption.name ? iconOption.filled : iconOption.outlined}
                    </IconButton>
                  </Tooltip>
                ))}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
              }
              label="Set as default category"
            />

            {isDefault && (
              <Typography variant="caption" color="text.secondary">
                Default categories are automatically assigned to new tasks when no category is selected.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {editCategory ? 'Update' : 'Add'} Category
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryForm; 