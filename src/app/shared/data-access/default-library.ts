import { Category, ReminderDatabase, Tag } from '../models/reminder.models';

const DEFAULT_CREATED_AT = '2026-05-22T00:00:00.000Z';

export const UNKNOWN_CATEGORY: Category = {
  id: 'cat_unknown',
  name: 'Sconosciuto',
  color: '#6b7280',
  icon: 'pi pi-question-circle',
  createdAt: DEFAULT_CREATED_AT,
};

export const CATEGORY_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#fb923c',
  '#fcd34d',
  '#059669',
  '#db2777',
  '#e11d48',
  '#dc2626',
  '#94a3b8',
  '#1f2937',
];

export const CATEGORY_ICONS = [
  { label: 'Lavoro', value: 'pi pi-briefcase' },
  { label: 'Persona', value: 'pi pi-user' },
  { label: 'Todo', value: 'pi pi-check-square' },
  { label: 'Idea', value: 'pi pi-lightbulb' },
  { label: 'Finanze', value: 'pi pi-wallet' },
  { label: 'Shopping', value: 'pi pi-shopping-cart' },
  { label: 'Salute', value: 'pi pi-heart' },
  { label: 'Fitness', value: 'pi pi-bolt' },
  { label: 'Casa', value: 'pi pi-home' },
  { label: 'Auto', value: 'pi pi-car' },
  { label: 'Altro', value: 'pi pi-question-circle' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_work',
    name: 'Work',
    color: '#2563eb',
    icon: 'pi pi-briefcase',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_personal',
    name: 'Personal',
    color: '#9333ea',
    icon: 'pi pi-user',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_tasks',
    name: 'To-Do',
    color: '#fb923c',
    icon: 'pi pi-check-square',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_ideas',
    name: 'Ideas',
    color: '#fcd34d',
    icon: 'pi pi-lightbulb',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_finances',
    name: 'Finances',
    color: '#059669',
    icon: 'pi pi-wallet',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    color: '#db2777',
    icon: 'pi pi-shopping-cart',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_health',
    name: 'Health & Habits',
    color: '#e11d48',
    icon: 'pi pi-heart',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_fitness',
    name: 'Fitness',
    color: '#dc2626',
    icon: 'pi pi-bolt',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_home',
    name: 'Household',
    color: '#94a3b8',
    icon: 'pi pi-home',
    createdAt: DEFAULT_CREATED_AT,
  },
  {
    id: 'cat_vehicle',
    name: 'Vehicle',
    color: '#1f2937',
    icon: 'pi pi-car',
    createdAt: DEFAULT_CREATED_AT,
  },
];

export const DEFAULT_TAGS: Tag[] = [
  { id: 'tag_urgent', name: 'Urgent', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_todo', name: 'To Do', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_working', name: 'Working', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_done', name: 'Done', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_meeting', name: 'Meeting', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_idea', name: 'Idea', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_cleaning', name: 'Cleaning', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_laundry', name: 'Laundry', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_dishwasher', name: 'Dishwasher', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_hydration', name: 'Hydration', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_digestion', name: 'Digestion', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_mood', name: 'Mood', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_groceries', name: 'Groceries', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_expense', name: 'Expense', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_gym', name: 'Gym', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_fuel', name: 'Fuel', createdAt: DEFAULT_CREATED_AT },
  { id: 'tag_maintenance', name: 'Maintenance', createdAt: DEFAULT_CREATED_AT },
  { id: 'year_2025', name: '2025', createdAt: DEFAULT_CREATED_AT },
  { id: 'year_2026', name: '2026', createdAt: DEFAULT_CREATED_AT },
];

export function createDefaultDatabase(): ReminderDatabase {
  return {
    notes: [],
    todos: [],
    categories: structuredClone(DEFAULT_CATEGORIES),
    tags: structuredClone(DEFAULT_TAGS),
    templates: [],
  };
}
