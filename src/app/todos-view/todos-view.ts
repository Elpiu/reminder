import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TodoDraft } from '../shared/models/reminder.models';
import { ReminderViewBase } from '../shared/ui/reminder-view-base';

const EMPTY_TODO_DRAFT: TodoDraft = {
  title: '',
  description: '',
  categoryId: '',
  tagIds: [],
};

@Component({
  selector: 'app-todos-view',
  imports: [
    ButtonModule,
    CardModule,
    FormsModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="surface-panel narrow-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Todo</p>
          <h2>Cose da fare senza data</h2>
        </div>
      </div>

      <form class="stack-form" (ngSubmit)="saveTodo()">
        <label>
          Titolo
          <input
            pInputText
            name="todo-title"
            type="text"
            [(ngModel)]="todoDraft.title"
            placeholder="Es. Chiamare il dentista"
            required
          />
        </label>

        <label>
          Descrizione
          <textarea
            pTextarea
            name="todo-description"
            rows="3"
            [(ngModel)]="todoDraft.description"
            placeholder="Dettagli opzionali"
          ></textarea>
        </label>

        <div class="form-grid">
          <label>
            Categoria
            <p-select
              name="todo-category"
              [(ngModel)]="todoDraft.categoryId"
              [options]="categoryOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Nessuna"
              [showClear]="true"
              appendTo="body"
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
            <p-multiselect
              name="todo-tags"
              [(ngModel)]="todoDraft.tagIds"
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
          label="Aggiungi todo"
          icon="pi pi-plus"
          [disabled]="!todoDraft.title.trim()"
        />
      </form>

      <div class="item-list">
        @for (todo of store.todayTodos(); track todo.id) {
          <article class="item-card">
            <div>
              <h3>{{ todo.title }}</h3>
              @if (todo.description) {
                <p>{{ todo.description }}</p>
              }
              <div class="meta-row">
                @if (category(todo.categoryId); as selectedCategory) {
                  <span class="category-pill">
                    <i
                      [class]="selectedCategory.icon"
                      [style.color]="selectedCategory.color"
                      aria-hidden="true"
                    ></i>
                    {{ selectedCategory.name }}
                  </span>
                }
                @for (tagName of tagNames(todo.tagIds); track tagName) {
                  <span>#{{ tagName }}</span>
                }
              </div>
            </div>
            <div class="item-actions">
              <p-button
                icon="pi pi-calendar-plus"
                severity="success"
                text="true"
                ariaLabel="Completa e aggiungi a oggi"
                (onClick)="completeTodoToToday(todo.id)"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                text="true"
                ariaLabel="Elimina todo"
                (onClick)="deleteTodo(todo.id)"
              />
            </div>
          </article>
        } @empty {
          <p class="empty-state">La lista todo e vuota.</p>
        }
      </div>
    </p-card>
  `,
})
export class TodosView extends ReminderViewBase {
  protected todoDraft: TodoDraft = { ...EMPTY_TODO_DRAFT };

  protected async saveTodo(): Promise<void> {
    await this.store.addTodo(this.todoDraft);
    this.todoDraft = { ...EMPTY_TODO_DRAFT };
  }

  protected async deleteTodo(todoId: string): Promise<void> {
    await this.store.deleteTodo(todoId);
  }

  protected async completeTodoToToday(todoId: string): Promise<void> {
    await this.store.completeTodoToToday(todoId);
  }
}
