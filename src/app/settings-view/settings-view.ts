import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../shared/data-access/default-library';
import { CategoryDraft, NamedDraft, ReminderBackup } from '../shared/models/reminder.models';
import { ReminderViewBase } from '../shared/ui/reminder-view-base';

const EMPTY_CATEGORY_DRAFT: CategoryDraft = {
  name: '',
  color: CATEGORY_COLORS[0],
  icon: CATEGORY_ICONS[0].value,
};

interface ImportSummary {
  fileName: string;
  exportedAt: string;
  notes: number;
  todos: number;
  templates: number;
  categories: number;
  tags: number;
}

@Component({
  selector: 'app-settings-view',
  imports: [ButtonModule, CardModule, FormsModule, InputTextModule, SelectModule, TabsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-card styleClass="surface-panel narrow-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Impostazioni</p>
          <h2>Libreria e dati</h2>
        </div>
      </div>

      <p-tabs [(value)]="settingsTab">
        <p-tablist>
          <p-tab value="library">Libreria</p-tab>
          <p-tab value="data">Dati</p-tab>
          <p-tab value="reset">Reset</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="library">
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

                <label>
                  Icona
                  <p-select
                    name="category-icon"
                    [(ngModel)]="categoryDraft.icon"
                    [options]="categoryIcons"
                    optionLabel="label"
                    optionValue="value"
                    appendTo="body"
                  >
                    <ng-template pTemplate="selectedItem" let-option>
                      <span class="select-option">
                        <i [class]="option.value" aria-hidden="true"></i>
                        {{ option.label }}
                      </span>
                    </ng-template>
                    <ng-template pTemplate="item" let-option>
                      <span class="select-option">
                        <i [class]="option.value" aria-hidden="true"></i>
                        {{ option.label }}
                      </span>
                    </ng-template>
                  </p-select>
                </label>

                <div class="field-group">
                  <span>Colore</span>
                  <div class="swatch-row">
                    @for (color of categoryColors; track color) {
                      <button
                        type="button"
                        class="color-swatch"
                        [class.color-swatch-selected]="categoryDraft.color === color"
                        [style.background]="color"
                        [attr.aria-label]="'Seleziona colore ' + color"
                        (click)="selectCategoryColor(color)"
                      ></button>
                    }
                  </div>
                </div>

                <p-button
                  type="submit"
                  label="Aggiungi categoria"
                  icon="pi pi-folder-plus"
                  [disabled]="!categoryDraft.name.trim()"
                />

                <div class="chip-row">
                  @for (category of store.categories(); track category.id) {
                    <span class="chip-static chip-with-action">
                      <i [class]="category.icon" [style.color]="category.color" aria-hidden="true"></i>
                      <i class="color-dot" [style.background]="category.color" aria-hidden="true"></i>
                      {{ category.name }}
                      <p-button
                        icon="pi pi-times"
                        severity="danger"
                        text="true"
                        rounded="true"
                        size="small"
                        [ariaLabel]="'Elimina categoria ' + category.name"
                        (onClick)="deleteCategory(category.id)"
                      />
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
                    <span class="chip-static chip-with-action">
                      #{{ tag.name }}
                      <p-button
                        icon="pi pi-times"
                        severity="danger"
                        text="true"
                        rounded="true"
                        size="small"
                        [ariaLabel]="'Elimina tag ' + tag.name"
                        (onClick)="deleteTag(tag.id)"
                      />
                    </span>
                  } @empty {
                    <span class="empty-state inline-empty">Nessun tag.</span>
                  }
                </div>
              </form>
            </div>
          </p-tabpanel>

          <p-tabpanel value="data">
            <div class="settings-grid">
              <section class="stack-form">
                <div>
                  <h3>Esporta backup</h3>
                  <p class="muted-copy">
                    Scarica un file JSON con note, todo, template, categorie e tag.
                  </p>
                </div>

                <p-button
                  label="Esporta dati"
                  icon="pi pi-download"
                  (onClick)="exportData()"
                />
              </section>

              <section class="stack-form">
                <div>
                  <h3>Importa backup</h3>
                  <p class="muted-copy">
                    Il backup importato sostituisce tutti i dati locali salvati su questo
                    dispositivo.
                  </p>
                </div>

                <input
                  #importFileInput
                  hidden
                  type="file"
                  accept="application/json,.json"
                  (change)="selectImportFile($event)"
                />

                <p-button
                  label="Scegli file JSON"
                  icon="pi pi-upload"
                  severity="secondary"
                  (onClick)="importFileInput.click()"
                />

                @if (importSummary) {
                  <div class="backup-summary" aria-live="polite">
                    <strong>{{ importSummary.fileName }}</strong>
                    <span>Esportato: {{ importSummary.exportedAt }}</span>
                    <span>Note: {{ importSummary.notes }}</span>
                    <span>Todo: {{ importSummary.todos }}</span>
                    <span>Template: {{ importSummary.templates }}</span>
                    <span>Categorie: {{ importSummary.categories }}</span>
                    <span>Tag: {{ importSummary.tags }}</span>
                  </div>
                }

                <label>
                  Conferma import
                  <input
                    pInputText
                    name="import-confirmation"
                    type="text"
                    [(ngModel)]="importConfirmation"
                    placeholder="Scrivi IMPORTA"
                  />
                </label>

                <p-button
                  label="Importa e sostituisci"
                  icon="pi pi-database"
                  severity="danger"
                  [disabled]="!selectedBackup || importConfirmation !== 'IMPORTA'"
                  (onClick)="importSelectedBackup()"
                />

                @if (dataMessage) {
                  <p
                    class="data-message"
                    [class.data-message-error]="dataMessageType === 'error'"
                    aria-live="polite"
                  >
                    {{ dataMessage }}
                  </p>
                }
              </section>
            </div>
          </p-tabpanel>

          <p-tabpanel value="reset">
            <div class="stack-form reset-panel">
              <div>
                <h3>Riparti da zero</h3>
                <p class="muted-copy">
                  Cancella note, todo, template, categorie e tag. La libreria default verra ricreata.
                </p>
              </div>
              <label>
                Conferma
                <input
                  pInputText
                  name="reset-confirmation"
                  type="text"
                  [(ngModel)]="resetConfirmation"
                  placeholder="Scrivi RESET"
                />
              </label>
              <p-button
                label="Riparti da zero"
                icon="pi pi-refresh"
                severity="danger"
                [disabled]="resetConfirmation !== 'RESET'"
                (onClick)="resetDatabase()"
              />
            </div>
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </p-card>
  `,
})
export class SettingsView extends ReminderViewBase {
  protected readonly categoryColors = CATEGORY_COLORS;
  protected readonly categoryIcons = CATEGORY_ICONS;
  protected settingsTab: string | number | undefined = 'library';
  protected categoryDraft: CategoryDraft = { ...EMPTY_CATEGORY_DRAFT };
  protected tagDraft: NamedDraft = { name: '' };
  protected resetConfirmation = '';
  protected importConfirmation = '';
  protected selectedBackup: ReminderBackup | null = null;
  protected importSummary: ImportSummary | null = null;
  protected dataMessage = '';
  protected dataMessageType: 'success' | 'error' = 'success';

  protected async saveCategory(): Promise<void> {
    await this.store.addCategory(this.categoryDraft);
    this.categoryDraft = { ...EMPTY_CATEGORY_DRAFT };
  }

  protected async saveTag(): Promise<void> {
    await this.store.addTag(this.tagDraft.name);
    this.tagDraft = { name: '' };
  }

  protected selectCategoryColor(color: string): void {
    this.categoryDraft = { ...this.categoryDraft, color };
  }

  protected async deleteCategory(categoryId: string): Promise<void> {
    await this.store.deleteCategory(categoryId);
  }

  protected async deleteTag(tagId: string): Promise<void> {
    await this.store.deleteTag(tagId);
  }

  protected async resetDatabase(): Promise<void> {
    await this.store.resetDatabase();
    this.resetConfirmation = '';
  }

  protected exportData(): void {
    const backup = this.store.exportDatabase();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `reminder-backup-${backup.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.setDataMessage('Backup esportato.', 'success');
  }

  protected async selectImportFile(event: Event): Promise<void> {
    const input = event.target;

    if (!(input instanceof HTMLInputElement) || !input.files?.length) {
      return;
    }

    const file = input.files[0];
    this.clearSelectedBackup();

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const backup = this.store.normalizeBackup(parsed);

      this.selectedBackup = backup;
      this.importSummary = this.toImportSummary(file.name, backup);
      this.setDataMessage('File pronto per importazione.', 'success');
    } catch (error: unknown) {
      this.setDataMessage(toDataErrorMessage(error), 'error');
    } finally {
      input.value = '';
    }
  }

  protected async importSelectedBackup(): Promise<void> {
    if (!this.selectedBackup || this.importConfirmation !== 'IMPORTA') {
      return;
    }

    try {
      await this.store.importDatabase(this.selectedBackup);
      this.clearSelectedBackup();
      this.importConfirmation = '';
      this.setDataMessage('Backup importato. I dati locali sono stati sostituiti.', 'success');
    } catch (error: unknown) {
      this.setDataMessage(toDataErrorMessage(error), 'error');
    }
  }

  private clearSelectedBackup(): void {
    this.selectedBackup = null;
    this.importSummary = null;
    this.importConfirmation = '';
  }

  private toImportSummary(fileName: string, backup: ReminderBackup): ImportSummary {
    return {
      fileName,
      exportedAt: this.formatExportedAt(backup.exportedAt),
      notes: backup.database.notes.length,
      todos: backup.database.todos.length,
      templates: backup.database.templates.length,
      categories: backup.database.categories.length,
      tags: backup.database.tags.length,
    };
  }

  private formatExportedAt(exportedAt: string): string {
    const date = new Date(exportedAt);

    if (Number.isNaN(date.getTime())) {
      return exportedAt;
    }

    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  private setDataMessage(message: string, type: 'success' | 'error'): void {
    this.dataMessage = message;
    this.dataMessageType = type;
  }
}

function toDataErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Il backup selezionato non e valido.';
}
