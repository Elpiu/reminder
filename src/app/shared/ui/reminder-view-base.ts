import { inject } from '@angular/core';
import { ReminderStore } from '../data-access/reminder.store';
import { CalendarNote, Category } from '../models/reminder.models';
import { fromDateKey } from '../utils/date-utils';

export interface SelectOption {
  label: string;
  value: string;
  color?: string;
  icon?: string;
}

export abstract class ReminderViewBase {
  protected readonly store = inject(ReminderStore);

  protected categoryOptions(): SelectOption[] {
    return this.store
      .categories()
      .map((category) => ({
        label: category.name,
        value: category.id,
        color: category.color,
        icon: category.icon,
      }));
  }

  protected tagOptions(): SelectOption[] {
    return this.store.tags().map((tag) => ({ label: `#${tag.name}`, value: tag.id }));
  }

  protected categoryName(categoryId: string | null): string {
    return this.category(categoryId)?.name ?? '';
  }

  protected category(categoryId: string | null): Category | undefined {
    return this.store.categories().find((item) => item.id === categoryId);
  }

  protected tagNames(tagIds: string[]): string[] {
    return tagIds
      .map((tagId) => this.store.tags().find((tag) => tag.id === tagId)?.name)
      .filter((name): name is string => Boolean(name));
  }

  protected compactDate(dateKey: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(fromDateKey(dateKey));
  }

  protected sourceLabel(source: CalendarNote['source']): string {
    const labels: Record<CalendarNote['source'], string> = {
      manual: 'nota',
      todo: 'todo',
      template: 'template',
    };

    return labels[source];
  }
}
