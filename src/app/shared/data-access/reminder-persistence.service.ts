import { Injectable } from '@angular/core';
import { createStore, get, set } from 'idb-keyval';
import {
  CalendarNote,
  Category,
  RecurringNoteTemplate,
  ReminderBackup,
  ReminderDatabase,
  Tag,
  TodoItem,
} from '../models/reminder.models';
import { createDefaultDatabase, UNKNOWN_CATEGORY } from './default-library';

const DATABASE_KEY = 'reminder-database-v1';
const BACKUP_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class ReminderPersistenceService {
  private readonly store = createStore('reminder', 'app-state');

  async load(): Promise<ReminderDatabase> {
    const stored = await get<Partial<ReminderDatabase>>(DATABASE_KEY, this.store);

    if (!stored) {
      return createDefaultDatabase();
    }

    return {
      notes: stored?.notes ?? [],
      todos: stored?.todos ?? [],
      categories: (stored?.categories ?? []).map((category) => ({
        ...category,
        icon: category.icon ?? UNKNOWN_CATEGORY.icon,
      })),
      tags: stored?.tags ?? [],
      templates: stored?.templates ?? [],
    };
  }

  async save(database: ReminderDatabase): Promise<void> {
    await set(DATABASE_KEY, database, this.store);
  }

  createBackup(database: ReminderDatabase): ReminderBackup {
    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      database,
    };
  }

  normalizeBackup(input: unknown): ReminderBackup {
    const backup = asRecord(input, 'Il file non contiene un backup valido.');

    if (backup['version'] !== BACKUP_VERSION) {
      throw new Error('Versione backup non supportata.');
    }

    if (typeof backup['exportedAt'] !== 'string') {
      throw new Error('Il backup non contiene una data di esportazione valida.');
    }

    return {
      version: BACKUP_VERSION,
      exportedAt: backup['exportedAt'],
      database: normalizeDatabase(backup['database']),
    };
  }

  emptyDatabase(): ReminderDatabase {
    return createDefaultDatabase();
  }
}

function normalizeDatabase(input: unknown): ReminderDatabase {
  const database = asRecord(input, 'Il backup non contiene dati validi.');

  return {
    notes: requireArray(database, 'notes').map(normalizeCalendarNote),
    todos: requireArray(database, 'todos').map(normalizeTodoItem),
    categories: requireArray(database, 'categories').map(normalizeCategory),
    tags: requireArray(database, 'tags').map(normalizeTag),
    templates: requireArray(database, 'templates').map(normalizeTemplate),
  };
}

function normalizeCalendarNote(input: unknown): CalendarNote {
  const note = asRecord(input, 'Una nota calendario nel backup non e valida.');

  return {
    id: requireString(note, 'id'),
    title: requireString(note, 'title'),
    description: requireString(note, 'description'),
    date: requireString(note, 'date'),
    categoryId: optionalString(note, 'categoryId'),
    tagIds: requireStringArray(note, 'tagIds'),
    source: requireSource(note['source']),
    createdAt: requireString(note, 'createdAt'),
    updatedAt: requireString(note, 'updatedAt'),
  };
}

function normalizeTodoItem(input: unknown): TodoItem {
  const todo = asRecord(input, 'Un todo nel backup non e valido.');

  return {
    id: requireString(todo, 'id'),
    title: requireString(todo, 'title'),
    description: requireString(todo, 'description'),
    categoryId: optionalString(todo, 'categoryId'),
    tagIds: requireStringArray(todo, 'tagIds'),
    createdAt: requireString(todo, 'createdAt'),
    updatedAt: requireString(todo, 'updatedAt'),
  };
}

function normalizeCategory(input: unknown): Category {
  const category = asRecord(input, 'Una categoria nel backup non e valida.');

  return {
    id: requireString(category, 'id'),
    name: requireString(category, 'name'),
    color: requireString(category, 'color'),
    icon: typeof category['icon'] === 'string' ? category['icon'] : UNKNOWN_CATEGORY.icon,
    createdAt: requireString(category, 'createdAt'),
  };
}

function normalizeTag(input: unknown): Tag {
  const tag = asRecord(input, 'Un tag nel backup non e valido.');

  return {
    id: requireString(tag, 'id'),
    name: requireString(tag, 'name'),
    createdAt: requireString(tag, 'createdAt'),
  };
}

function normalizeTemplate(input: unknown): RecurringNoteTemplate {
  const template = asRecord(input, 'Un template nel backup non e valido.');

  return {
    id: requireString(template, 'id'),
    title: requireString(template, 'title'),
    description: requireString(template, 'description'),
    categoryId: optionalString(template, 'categoryId'),
    tagIds: requireStringArray(template, 'tagIds'),
    createdAt: requireString(template, 'createdAt'),
    updatedAt: requireString(template, 'updatedAt'),
  };
}

function asRecord(input: unknown, message: string): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error(message);
  }

  return input as Record<string, unknown>;
}

function requireArray(record: Record<string, unknown>, field: keyof ReminderDatabase): unknown[] {
  const value = record[field];

  if (!Array.isArray(value)) {
    throw new Error(`La collezione "${field}" manca o non e valida.`);
  }

  return value;
}

function requireString(record: Record<string, unknown>, field: string): string {
  const value = record[field];

  if (typeof value !== 'string') {
    throw new Error(`Il campo "${field}" manca o non e valido.`);
  }

  return value;
}

function optionalString(record: Record<string, unknown>, field: string): string | null {
  const value = record[field];

  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`Il campo "${field}" non e valido.`);
  }

  return value;
}

function requireStringArray(record: Record<string, unknown>, field: string): string[] {
  const value = record[field];

  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Il campo "${field}" manca o non e valido.`);
  }

  return value;
}

function requireSource(input: unknown): CalendarNote['source'] {
  if (input === 'manual' || input === 'todo' || input === 'template') {
    return input;
  }

  throw new Error('La sorgente di una nota calendario non e valida.');
}
