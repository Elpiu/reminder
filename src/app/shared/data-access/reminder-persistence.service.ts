import { Injectable } from '@angular/core';
import { createStore, get, set } from 'idb-keyval';
import { ReminderDatabase } from '../models/reminder.models';

const DATABASE_KEY = 'reminder-database-v1';

const EMPTY_DATABASE: ReminderDatabase = {
  notes: [],
  todos: [],
  categories: [],
  tags: [],
  templates: [],
};

@Injectable({ providedIn: 'root' })
export class ReminderPersistenceService {
  private readonly store = createStore('reminder', 'app-state');

  async load(): Promise<ReminderDatabase> {
    const stored = await get<Partial<ReminderDatabase>>(DATABASE_KEY, this.store);

    return {
      notes: stored?.notes ?? [],
      todos: stored?.todos ?? [],
      categories: stored?.categories ?? [],
      tags: stored?.tags ?? [],
      templates: stored?.templates ?? [],
    };
  }

  async save(database: ReminderDatabase): Promise<void> {
    await set(DATABASE_KEY, database, this.store);
  }

  emptyDatabase(): ReminderDatabase {
    return structuredClone(EMPTY_DATABASE);
  }
}
