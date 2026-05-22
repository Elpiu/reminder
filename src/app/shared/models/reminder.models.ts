export type AppView = 'calendar' | 'todos' | 'recurring' | 'search' | 'settings';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt: string;
}

export interface CalendarNote {
  id: string;
  title: string;
  description: string;
  date: string;
  categoryId: string | null;
  tagIds: string[];
  source: 'manual' | 'todo' | 'template';
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecurringNoteTemplate {
  id: string;
  title: string;
  description: string;
  categoryId: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  tagId: string;
}

export interface ReminderDatabase {
  notes: CalendarNote[];
  todos: TodoItem[];
  categories: Category[];
  tags: Tag[];
  templates: RecurringNoteTemplate[];
}

export interface ReminderBackup {
  version: 1;
  exportedAt: string;
  database: ReminderDatabase;
}

export interface CalendarDay {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  noteCount: number;
  todoCount: number;
}

export interface NoteDraft {
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
}

export interface TodoDraft {
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
}

export interface NamedDraft {
  name: string;
}

export interface CategoryDraft extends NamedDraft {
  color: string;
  icon: string;
}
