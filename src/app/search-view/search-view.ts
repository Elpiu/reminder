import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CalendarNote, SearchFilters } from '../shared/models/reminder.models';
import { ReminderViewBase } from '../shared/ui/reminder-view-base';
import { fromDateKey, toDateKey } from '../shared/utils/date-utils';

const EMPTY_SEARCH_FILTERS: SearchFilters = {
  query: '',
  startDate: '',
  endDate: '',
  categoryId: '',
  tagId: '',
};

@Component({
  selector: 'app-search-view',
  imports: [ButtonModule, CardModule, DatePickerModule, FormsModule, InputTextModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="surface-panel narrow-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Ricerca</p>
          <h2>Trova note</h2>
        </div>
        <p-button label="Reset" severity="secondary" size="small" (onClick)="resetSearch()" />
      </div>

      <div class="stack-form">
        <label>
          Titolo o descrizione
          <input
            pInputText
            name="search-query"
            type="search"
            [(ngModel)]="searchFilters.query"
            (ngModelChange)="applySearch()"
            placeholder="Cerca testo"
          />
        </label>

        <div class="form-grid">
          <label>
            Da
            <p-datepicker
              name="search-start"
              [(ngModel)]="startDate"
              dateFormat="dd/mm/yy"
              placeholder="Seleziona data"
              [iconDisplay]="'input'"
              [firstDayOfWeek]="1"
              [showButtonBar]="true"
              [showIcon]="true"
              appendTo="body"
              (ngModelChange)="onStartDateChange($event)"
            />
          </label>
          <label>
            A
            <p-datepicker
              name="search-end"
              [(ngModel)]="endDate"
              dateFormat="dd/mm/yy"
              placeholder="Seleziona data"
              [iconDisplay]="'input'"
              [firstDayOfWeek]="1"
              [showButtonBar]="true"
              [showIcon]="true"
              appendTo="body"
              (ngModelChange)="onEndDateChange($event)"
            />
          </label>
        </div>

        <div class="form-grid">
          <label>
            Categoria
            <p-select
              name="search-category"
              [(ngModel)]="searchFilters.categoryId"
              [options]="categoryOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Tutte"
              [showClear]="true"
              appendTo="body"
              (ngModelChange)="applySearch()"
            >
              <ng-template pTemplate="selectedItem" let-option>
                <span class="select-option">
                  <i [class]="option.icon" [style.color]="option.color" aria-hidden="true"></i>
                  {{ option.label }}
                </span>
              </ng-template>
              <ng-template pTemplate="item" let-option>
                <span class="select-option">
                  <i [class]="option.icon" [style.color]="option.color" aria-hidden="true"></i>
                  {{ option.label }}
                </span>
              </ng-template>
            </p-select>
          </label>
          <label>
            Tag
            <p-select
              name="search-tag"
              [(ngModel)]="searchFilters.tagId"
              [options]="tagOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Tutti"
              [showClear]="true"
              appendTo="body"
              (ngModelChange)="applySearch()"
            />
          </label>
        </div>
      </div>

      <div class="item-list">
        @for (note of store.searchResults(); track note.id) {
          <article class="item-card item-card-clickable" (click)="openSearchResult(note)">
            <div>
              <span class="date-pill">{{ compactDate(note.date) }}</span>
              <h3>{{ note.title }}</h3>
              @if (note.description) {
                <p>{{ note.description }}</p>
              }
              <div class="meta-row">
                @if (category(note.categoryId); as selectedCategory) {
                  <span class="category-pill">
                    <i
                      [class]="selectedCategory.icon"
                      [style.color]="selectedCategory.color"
                      aria-hidden="true"
                    ></i>
                    {{ selectedCategory.name }}
                  </span>
                }
                @for (tagName of tagNames(note.tagIds); track tagName) {
                  <span>#{{ tagName }}</span>
                }
              </div>
            </div>
          </article>
        } @empty {
          <p class="empty-state">
            @if (store.hasActiveSearch()) {
              Nessuna nota corrisponde alla ricerca.
            } @else {
              Inserisci almeno un filtro per iniziare.
            }
          </p>
        }
      </div>
    </p-card>
  `,
})
export class SearchView extends ReminderViewBase {
  protected searchFilters: SearchFilters = { ...this.store.searchFilters() };
  protected startDate = dateFromFilter(this.searchFilters.startDate);
  protected endDate = dateFromFilter(this.searchFilters.endDate);

  protected applySearch(): void {
    this.store.setSearchFilters({ ...this.searchFilters });
  }

  protected onStartDateChange(value: Date | Date[] | null): void {
    this.searchFilters.startDate = value instanceof Date ? toDateKey(value) : '';
    this.applySearch();
  }

  protected onEndDateChange(value: Date | Date[] | null): void {
    this.searchFilters.endDate = value instanceof Date ? toDateKey(value) : '';
    this.applySearch();
  }

  protected resetSearch(): void {
    this.searchFilters = { ...EMPTY_SEARCH_FILTERS };
    this.startDate = null;
    this.endDate = null;
    this.store.resetSearchFilters();
  }

  protected openSearchResult(note: CalendarNote): void {
    this.store.selectDate(note.date);
  }
}

function dateFromFilter(dateKey: string): Date | null {
  return dateKey ? fromDateKey(dateKey) : null;
}
