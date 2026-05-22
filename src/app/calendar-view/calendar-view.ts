import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerDateMeta } from 'primeng/types/datepicker';
import { NoteDraft } from '../shared/models/reminder.models';
import { ReminderViewBase } from '../shared/ui/reminder-view-base';
import { formatDisplayDate, fromDateKey, todayKey, toDateKey } from '../shared/utils/date-utils';

const EMPTY_NOTE_DRAFT: NoteDraft = {
  title: '',
  description: '',
  categoryId: '',
  tagIds: [],
};

@Component({
  selector: 'app-calendar-view',
  imports: [
    ButtonModule,
    CardModule,
    DatePickerModule,
    FormsModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    SharedModule,
    TextareaModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="calendar-layout">
      <p-card styleClass="surface-panel calendar-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Calendario</p>
            <h2>{{ selectedDateLabel() }}</h2>
          </div>
          <p-button label="Oggi" icon="pi pi-calendar" size="small" (onClick)="selectToday()" />
        </div>

        <p-datepicker
          [(ngModel)]="calendarDate"
          [inline]="true"
          [showWeek]="true"
          [firstDayOfWeek]="1"
          [showOtherMonths]="true"
          [selectOtherMonths]="true"
          (ngModelChange)="onCalendarDateChange($event)"
        >
          <ng-template pTemplate="date" let-date>
            <span
              class="calendar-day-content"
              [class.day-today]="date.today"
              [class.day-selected]="dateKeyFromMeta(date) === store.selectedDate()"
              [class.day-other-month]="date.otherMonth"
            >
              <span>{{ date.day }}</span>
              @if (noteCountForDateMeta(date)) {
                <small>{{ noteCountForDateMeta(date) }}</small>
              }
            </span>
          </ng-template>
        </p-datepicker>
      </p-card>

      <p-card styleClass="surface-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Giorno selezionato</p>
            <h2>Note del giorno</h2>
          </div>
        </div>

        <form class="stack-form" (ngSubmit)="saveNote()">
          <label>
            Titolo
            <input
              pInputText
              name="note-title"
              type="text"
              [(ngModel)]="noteDraft.title"
              placeholder="Es. Pagare bolletta"
              required
            />
          </label>

          <label>
            Descrizione
            <textarea
              pTextarea
              name="note-description"
              rows="3"
              [(ngModel)]="noteDraft.description"
              placeholder="Dettagli opzionali"
            ></textarea>
          </label>

          <div class="form-grid">
            <label>
              Categoria
              <p-select
                name="note-category"
                [(ngModel)]="noteDraft.categoryId"
                [options]="categoryOptions()"
                optionLabel="label"
                optionValue="value"
                placeholder="Nessuna"
                [showClear]="true"
                appendTo="body"
              />
            </label>

            <label>
              Tag
              <p-multiselect
                name="note-tags"
                [(ngModel)]="noteDraft.tagIds"
                [options]="tagOptions()"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleziona tag"
                display="chip"
                appendTo="body"
              />
            </label>
          </div>

          <p-button
            type="submit"
            label="Aggiungi nota"
            icon="pi pi-plus"
            [disabled]="!noteDraft.title.trim()"
          />
        </form>

        <div class="item-list">
          @for (note of store.selectedDateNotes(); track note.id) {
            <article class="item-card">
              <div>
                <div class="item-title-row">
                  <h3>{{ note.title }}</h3>
                  <span class="source-pill">{{ sourceLabel(note.source) }}</span>
                </div>
                @if (note.description) {
                  <p>{{ note.description }}</p>
                }
                <div class="meta-row">
                  @if (categoryName(note.categoryId)) {
                    <span>{{ categoryName(note.categoryId) }}</span>
                  }
                  @for (tagName of tagNames(note.tagIds); track tagName) {
                    <span>#{{ tagName }}</span>
                  }
                </div>
              </div>
              <div class="item-actions">
                <p-button
                  icon="pi pi-refresh"
                  severity="secondary"
                  text="true"
                  ariaLabel="Aggiungi ai ricorrenti"
                  (onClick)="createTemplate(note.id)"
                />
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  text="true"
                  ariaLabel="Elimina nota"
                  (onClick)="deleteNote(note.id)"
                />
              </div>
            </article>
          } @empty {
            <p class="empty-state">Nessuna nota per questo giorno.</p>
          }
        </div>
      </p-card>
    </section>
  `,
})
export class CalendarView extends ReminderViewBase {
  protected calendarDate = fromDateKey(todayKey());
  protected noteDraft: NoteDraft = { ...EMPTY_NOTE_DRAFT };

  protected selectedDateLabel(): string {
    return formatDisplayDate(this.store.selectedDate());
  }

  protected onCalendarDateChange(value: Date | Date[] | null): void {
    if (value instanceof Date) {
      this.store.selectDate(toDateKey(value));
    }
  }

  protected selectDay(dateKey: string): void {
    this.calendarDate = fromDateKey(dateKey);
    this.store.selectDate(dateKey);
  }

  protected selectToday(): void {
    this.selectDay(todayKey());
  }

  protected dateKeyFromMeta(date: DatePickerDateMeta): string {
    return toDateKey(new Date(date.year, date.month, date.day));
  }

  protected noteCountForDateMeta(date: DatePickerDateMeta): number {
    const dateKey = this.dateKeyFromMeta(date);

    return this.store.notes().filter((note) => note.date === dateKey).length;
  }

  protected async saveNote(): Promise<void> {
    await this.store.addNote(this.noteDraft);
    this.noteDraft = { ...EMPTY_NOTE_DRAFT };
  }

  protected async deleteNote(noteId: string): Promise<void> {
    await this.store.deleteNote(noteId);
  }

  protected async createTemplate(noteId: string): Promise<void> {
    await this.store.createTemplateFromNote(noteId);
  }
}
