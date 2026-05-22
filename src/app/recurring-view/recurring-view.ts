import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ReminderViewBase } from '../shared/ui/reminder-view-base';

@Component({
  selector: 'app-recurring-view',
  imports: [ButtonModule, CardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="surface-panel narrow-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Ricorrenti</p>
          <h2>Template rapidi</h2>
        </div>
      </div>

      <div class="item-list">
        @for (template of store.templatesByRecent(); track template.id) {
          <article class="item-card">
            <div>
              <h3>{{ template.title }}</h3>
              @if (template.description) {
                <p>{{ template.description }}</p>
              }
              <div class="meta-row">
                @if (categoryName(template.categoryId)) {
                  <span>{{ categoryName(template.categoryId) }}</span>
                }
                @for (tagName of tagNames(template.tagIds); track tagName) {
                  <span>#{{ tagName }}</span>
                }
              </div>
            </div>
            <div class="item-actions">
              <p-button
                icon="pi pi-plus"
                severity="success"
                text="true"
                ariaLabel="Aggiungi template a oggi"
                (onClick)="addTemplateToToday(template.id)"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                text="true"
                ariaLabel="Elimina template"
                (onClick)="deleteTemplate(template.id)"
              />
            </div>
          </article>
        } @empty {
          <p class="empty-state">Salva una nota come ricorrente per creare il primo template.</p>
        }
      </div>
    </p-card>
  `,
})
export class RecurringView extends ReminderViewBase {
  protected async addTemplateToToday(templateId: string): Promise<void> {
    await this.store.addTemplateToToday(templateId);
  }

  protected async deleteTemplate(templateId: string): Promise<void> {
    await this.store.deleteTemplate(templateId);
  }
}
