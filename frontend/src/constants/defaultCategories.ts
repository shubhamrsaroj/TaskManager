interface DefaultCategory {
  name: string;
  color: string;
  icon: string;
  description: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: 'Education',
    color: '#4F46E5', // Indigo
    icon: 'school',
    description: 'Academic tasks and learning activities'
  },
  {
    name: 'Work',
    color: '#0EA5E9', // Sky blue
    icon: 'work',
    description: 'Professional and career-related tasks'
  },
  {
    name: 'Health',
    color: '#10B981', // Emerald
    icon: 'favorite',
    description: 'Exercise, medication, and wellness activities'
  },
  {
    name: 'Personal',
    color: '#8B5CF6', // Purple
    icon: 'person',
    description: 'Personal development and lifestyle tasks'
  },
  {
    name: 'Shopping',
    color: '#F59E0B', // Amber
    icon: 'shopping_cart',
    description: 'Shopping lists and purchases'
  },
  {
    name: 'Family',
    color: '#EC4899', // Pink
    icon: 'family_restroom',
    description: 'Family-related responsibilities'
  },
  {
    name: 'Hobbies',
    color: '#6366F1', // Violet
    icon: 'sports_esports',
    description: 'Recreational activities and hobbies'
  },
  {
    name: 'Travel',
    color: '#F43F5E', // Rose
    icon: 'flight',
    description: 'Travel plans and arrangements'
  },
  {
    name: 'Finance',
    color: '#059669', // Green
    icon: 'account_balance',
    description: 'Financial tasks and budgeting'
  },
  {
    name: 'Home',
    color: '#D946EF', // Fuchsia
    icon: 'home',
    description: 'Household chores and maintenance'
  }
]; 