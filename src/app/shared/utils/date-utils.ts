import { CalendarDay, CalendarNote, TodoItem } from '../models/reminder.models';

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function fromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function formatDisplayDate(dateKey: string): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(fromDateKey(dateKey));
}

export function buildMonthDays(
  selectedDateKey: string,
  notes: CalendarNote[],
  todos: TodoItem[],
): CalendarDay[] {
  const selectedDate = fromDateKey(selectedDateKey);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const mondayFirstOffset = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayFirstOffset);
  const currentToday = todayKey();
  const noteCounts = countByDate(notes.map((note) => note.date));
  const todoCount = todos.length;

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const dateKey = toDateKey(date);

    return {
      date: dateKey,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
      isToday: dateKey === currentToday,
      noteCount: noteCounts.get(dateKey) ?? 0,
      todoCount: dateKey === currentToday ? todoCount : 0,
    };
  });
}

function countByDate(dateKeys: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const dateKey of dateKeys) {
    counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
  }

  return counts;
}
