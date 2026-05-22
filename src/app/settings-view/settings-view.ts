import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { NamedDraft } from '../shared/models/reminder.models';
import { ReminderViewBase } from '../shared/ui/reminder-view-base';

@Component({
  selector: 'app-settings-view',
  imports: [ButtonModule, CardModule, FormsModule, InputTextModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="surface-panel narrow-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Libreria</p>
          <h2>Categorie e tag</h2>
        </div>
      </div>

      <div class="settings-grid">
        <form class="stack-form" (ngSubmit)="saveCategory()">
          <label>
            Nuova categoria
            <input
              pInputText
              name="category-name"
              type="text"
              [(ngModel)]="categoryDraft.name"
              placeholder="Es. Casa"
              required
            />
          </label>
          <p-button
            type="submit"
            label="Aggiungi categoria"
            icon="pi pi-folder-plus"
            [disabled]="!categoryDraft.name.trim()"
          />

          <div class="chip-row">
            @for (category of store.categories(); track category.id) {
              <span class="chip-static">
                <i class="color-dot" [style.background]="category.color" aria-hidden="true"></i>
                {{ category.name }}
              </span>
            } @empty {
              <span class="empty-state inline-empty">Nessuna categoria.</span>
            }
          </div>
        </form>

        <form class="stack-form" (ngSubmit)="saveTag()">
          <label>
            Nuovo tag
            <input
              pInputText
              name="tag-name"
              type="text"
              [(ngModel)]="tagDraft.name"
              placeholder="Es. urgente"
              required
            />
          </label>
          <p-button
            type="submit"
            label="Aggiungi tag"
            icon="pi pi-hashtag"
            [disabled]="!tagDraft.name.trim()"
          />

          <div class="chip-row">
            @for (tag of store.tags(); track tag.id) {
              <span class="chip-static">#{{ tag.name }}</span>
            } @empty {
              <span class="empty-state inline-empty">Nessun tag.</span>
            }
          </div>
        </form>
      </div>
    </p-card>
  `,
})
export class SettingsView extends ReminderViewBase {
  protected categoryDraft: NamedDraft = { name: '' };
  protected tagDraft: NamedDraft = { name: '' };

  protected async saveCategory(): Promise<void> {
    await this.store.addCategory(this.categoryDraft.name);
    this.categoryDraft = { name: '' };
  }

  protected async saveTag(): Promise<void> {
    await this.store.addTag(this.tagDraft.name);
    this.tagDraft = { name: '' };
  }
}
