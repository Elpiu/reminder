import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import {
  AppView,
  CalendarNote,
  Category,
  CategoryDraft,
  RecurringNoteTemplate,
  ReminderBackup,
  ReminderDatabase,
  SearchFilters,
  Tag,
  TodoItem,
} from '../models/reminder.models';
import { buildMonthDays, todayKey } from '../utils/date-utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from './default-library';
import { ReminderPersistenceService } from './reminder-persistence.service';

interface ReminderState extends ReminderDatabase {
  activeView: AppView;
  selectedDate: string;
  searchFilters: SearchFilters;
  isLoading: boolean;
  error: string | null;
}

interface NoteInput {
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
}

interface TodoInput {
  title: string;
  description: string;
  categoryId: string;
  tagIds: string[];
}

const initialSearchFilters: SearchFilters = {
  query: '',
  startDate: '',
  endDate: '',
  categoryId: '',
  tagId: '',
};

const initialState: ReminderState = {
  notes: [],
  todos: [],
  categories: [],
  tags: [],
  templates: [],
  activeView: 'calendar',
  selectedDate: todayKey(),
  searchFilters: initialSearchFilters,
  isLoading: false,
  error: null,
};

export const ReminderStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    selectedDateNotes: computed(() =>
      store
        .notes()
        .filter((note) => note.date === store.selectedDate())
        .sort(sortByUpdatedDesc),
    ),
    monthDays: computed(() => buildMonthDays(store.selectedDate(), store.notes(), store.todos())),
    todayTodos: computed(() => store.todos().sort(sortByCreatedDesc)),
    templatesByRecent: computed(() => store.templates().sort(sortByUpdatedDesc)),
    searchResults: computed(() => {
      const filters = store.searchFilters();
      const query = filters.query.trim().toLowerCase();

      return store
        .notes()
        .filter((note) => matchesSearch(note, filters, query))
        .sort((first, second) => second.date.localeCompare(first.date));
    }),
    hasActiveSearch: computed(() => {
      const filters = store.searchFilters();

      return Boolean(
        filters.query.trim() ||
          filters.startDate ||
          filters.endDate ||
          filters.categoryId ||
          filters.tagId,
      );
    }),
  })),
  withMethods((store, persistence = inject(ReminderPersistenceService)) => {
    const saveCurrentState = async (): Promise<void> => {
      await persistence.save(snapshot(store));
    };

    return {
      async load(): Promise<void> {
        patchState(store, { isLoading: true, error: null });

        try {
          const database = await persistence.load();
          patchState(store, { ...database, isLoading: false });
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: toErrorMessage(error) });
        }
      },
      setActiveView(activeView: AppView): void {
        patchState(store, { activeView });
      },
      selectDate(selectedDate: string): void {
        patchState(store, { selectedDate, activeView: 'calendar' });
      },
      setSearchFilters(searchFilters: SearchFilters): void {
        patchState(store, { searchFilters });
      },
      resetSearchFilters(): void {
        patchState(store, { searchFilters: { ...initialSearchFilters } });
      },
      async addCategory(input: CategoryDraft): Promise<void> {
        const trimmed = input.name.trim();

        if (!trimmed || hasName(store.categories(), trimmed)) {
          return;
        }

        const now = new Date().toISOString();
        const category: Category = {
          id: createId(),
          name: trimmed,
          color: input.color || CATEGORY_COLORS[0],
          icon: input.icon || CATEGORY_ICONS[0].value,
          createdAt: now,
        };

        patchState(store, { categories: [...store.categories(), category] });
        await saveCurrentState();
      },
      async deleteCategory(categoryId: string): Promise<void> {
        patchState(store, {
          categories: store.categories().filter((category) => category.id !== categoryId),
          notes: store.notes().map((note) =>
            note.categoryId === categoryId ? { ...note, categoryId: null } : note,
          ),
          todos: store.todos().map((todo) =>
            todo.categoryId === categoryId ? { ...todo, categoryId: null } : todo,
          ),
          templates: store.templates().map((template) =>
            template.categoryId === categoryId ? { ...template, categoryId: null } : template,
          ),
          searchFilters:
            store.searchFilters().categoryId === categoryId
              ? { ...store.searchFilters(), categoryId: '' }
              : store.searchFilters(),
        });
        await saveCurrentState();
      },
      async addTag(name: string): Promise<void> {
        const trimmed = name.trim().replace(/^#/, '');

        if (!trimmed || hasName(store.tags(), trimmed)) {
          return;
        }

        const tag: Tag = {
          id: createId(),
          name: trimmed,
          createdAt: new Date().toISOString(),
        };

        patchState(store, { tags: [...store.tags(), tag] });
        await saveCurrentState();
      },
      async deleteTag(tagId: string): Promise<void> {
        patchState(store, {
          tags: store.tags().filter((tag) => tag.id !== tagId),
          notes: store.notes().map((note) => ({
            ...note,
            tagIds: note.tagIds.filter((id) => id !== tagId),
          })),
          todos: store.todos().map((todo) => ({
            ...todo,
            tagIds: todo.tagIds.filter((id) => id !== tagId),
          })),
          templates: store.templates().map((template) => ({
            ...template,
            tagIds: template.tagIds.filter((id) => id !== tagId),
          })),
          searchFilters:
            store.searchFilters().tagId === tagId
              ? { ...store.searchFilters(), tagId: '' }
              : store.searchFilters(),
        });
        await saveCurrentState();
      },
      async resetDatabase(): Promise<void> {
        const database = persistence.emptyDatabase();

        patchState(store, {
          ...database,
          selectedDate: todayKey(),
          searchFilters: { ...initialSearchFilters },
          error: null,
        });
        await saveCurrentState();
      },
      exportDatabase(): ReminderBackup {
        return persistence.createBackup(snapshot(store));
      },
      normalizeBackup(input: unknown): ReminderBackup {
        return persistence.normalizeBackup(input);
      },
      async importDatabase(backup: ReminderBackup): Promise<void> {
        patchState(store, {
          ...backup.database,
          selectedDate: todayKey(),
          searchFilters: { ...initialSearchFilters },
          activeView: 'settings',
          error: null,
        });
        await saveCurrentState();
      },
      async addNote(input: NoteInput): Promise<void> {
        const title = input.title.trim();

        if (!title) {
          return;
        }

        const now = new Date().toISOString();
        const note: CalendarNote = {
          id: createId(),
          title,
          description: input.description.trim(),
          date: store.selectedDate(),
          categoryId: input.categoryId || null,
          tagIds: input.tagIds,
          source: 'manual',
          createdAt: now,
          updatedAt: now,
        };

        patchState(store, { notes: [...store.notes(), note] });
        await saveCurrentState();
      },
      async deleteNote(noteId: string): Promise<void> {
        patchState(store, { notes: store.notes().filter((note) => note.id !== noteId) });
        await saveCurrentState();
      },
      async addTodo(input: TodoInput): Promise<void> {
        const title = input.title.trim();

        if (!title) {
          return;
        }

        const now = new Date().toISOString();
        const todo: TodoItem = {
          id: createId(),
          title,
          description: input.description.trim(),
          categoryId: input.categoryId || null,
          tagIds: input.tagIds,
          createdAt: now,
          updatedAt: now,
        };

        patchState(store, { todos: [...store.todos(), todo] });
        await saveCurrentState();
      },
      async deleteTodo(todoId: string): Promise<void> {
        patchState(store, { todos: store.todos().filter((todo) => todo.id !== todoId) });
        await saveCurrentState();
      },
      async completeTodoToToday(todoId: string): Promise<void> {
        const todo = store.todos().find((item) => item.id === todoId);

        if (!todo) {
          return;
        }

        const now = new Date().toISOString();
        const note: CalendarNote = {
          id: createId(),
          title: todo.title,
          description: todo.description,
          date: todayKey(),
          categoryId: todo.categoryId,
          tagIds: todo.tagIds,
          source: 'todo',
          createdAt: now,
          updatedAt: now,
        };

        patchState(store, {
          notes: [...store.notes(), note],
          todos: store.todos().filter((item) => item.id !== todoId),
          selectedDate: todayKey(),
          activeView: 'calendar',
        });
        await saveCurrentState();
      },
      async createTemplateFromNote(noteId: string): Promise<void> {
        const note = store.notes().find((item) => item.id === noteId);

        if (!note) {
          return;
        }

        const now = new Date().toISOString();
        const template: RecurringNoteTemplate = {
          id: createId(),
          title: note.title,
          description: note.description,
          categoryId: note.categoryId,
          tagIds: note.tagIds,
          createdAt: now,
          updatedAt: now,
        };

        patchState(store, { templates: [...store.templates(), template], activeView: 'recurring' });
        await saveCurrentState();
      },
      async addTemplateToToday(templateId: string): Promise<void> {
        const template = store.templates().find((item) => item.id === templateId);

        if (!template) {
          return;
        }

        const now = new Date().toISOString();
        const note: CalendarNote = {
          id: createId(),
          title: template.title,
          description: template.description,
          date: todayKey(),
          categoryId: template.categoryId,
          tagIds: template.tagIds,
          source: 'template',
          createdAt: now,
          updatedAt: now,
        };

        patchState(store, {
          notes: [...store.notes(), note],
          selectedDate: todayKey(),
          activeView: 'calendar',
        });
        await saveCurrentState();
      },
      async deleteTemplate(templateId: string): Promise<void> {
        patchState(store, {
          templates: store.templates().filter((template) => template.id !== templateId),
        });
        await saveCurrentState();
      },
    };
  }),
  withHooks({
    onInit(store): void {
      void store.load();
    },
  }),
);

function snapshot(store: {
  notes: () => CalendarNote[];
  todos: () => TodoItem[];
  categories: () => Category[];
  tags: () => Tag[];
  templates: () => RecurringNoteTemplate[];
}): ReminderDatabase {
  return {
    notes: store.notes(),
    todos: store.todos(),
    categories: store.categories(),
    tags: store.tags(),
    templates: store.templates(),
  };
}

function matchesSearch(note: CalendarNote, filters: SearchFilters, query: string): boolean {
  if (filters.startDate && note.date < filters.startDate) {
    return false;
  }

  if (filters.endDate && note.date > filters.endDate) {
    return false;
  }

  if (filters.categoryId && note.categoryId !== filters.categoryId) {
    return false;
  }

  if (filters.tagId && !note.tagIds.includes(filters.tagId)) {
    return false;
  }

  if (!query) {
    return true;
  }

  return `${note.title} ${note.description}`.toLowerCase().includes(query);
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function hasName(items: Array<{ name: string }>, name: string): boolean {
  return items.some((item) => item.name.toLowerCase() === name.toLowerCase());
}

function sortByUpdatedDesc(first: { updatedAt: string }, second: { updatedAt: string }): number {
  return second.updatedAt.localeCompare(first.updatedAt);
}

function sortByCreatedDesc(first: { createdAt: string }, second: { createdAt: string }): number {
  return second.createdAt.localeCompare(first.createdAt);
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Errore imprevisto durante il caricamento dati.';
}
