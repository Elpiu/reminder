import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CalendarView } from './calendar-view/calendar-view';
import { RecurringView } from './recurring-view/recurring-view';
import { SearchView } from './search-view/search-view';
import { SettingsView } from './settings-view/settings-view';
import { ReminderStore } from './shared/data-access/reminder.store';
import { AppView } from './shared/models/reminder.models';
import { TodosView } from './todos-view/todos-view';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, CalendarView, RecurringView, SearchView, SettingsView, TodosView],
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div>
          <p class="eyebrow">Offline PWA</p>
          <h1>Reminder</h1>
          <p class="subtitle">
            Calendario, note, todo e ricorrenti sempre disponibili sul dispositivo.
          </p>
        </div>
      </header>

      <nav class="bottom-nav" aria-label="Sezioni principali">
        @for (item of navigation; track item.view) {
          <p-button
            [label]="item.label"
            [icon]="item.icon"
            [text]="store.activeView() !== item.view"
            [severity]="store.activeView() === item.view ? 'primary' : 'secondary'"
            styleClass="nav-item"
            (onClick)="setView(item.view)"
          />
        }
      </nav>

      <main>
        @if (store.error()) {
          <section class="surface-panel alert-panel" aria-live="polite">
            {{ store.error() }}
          </section>
        }

        @switch (store.activeView()) {
          @case ('calendar') {
            <app-calendar-view />
          }

          @case ('todos') {
            <app-todos-view />
          }

          @case ('recurring') {
            <app-recurring-view />
          }

          @case ('search') {
            <app-search-view />
          }

          @case ('settings') {
            <app-settings-view />
          }
        }
      </main>
    </div>
  `,
})
export class App {
  protected readonly store = inject(ReminderStore);
  protected readonly navigation: Array<{ view: AppView; label: string; icon: string }> = [
    { view: 'calendar', label: 'Home', icon: 'pi pi-calendar' },
    { view: 'todos', label: 'Todo', icon: 'pi pi-check-square' },
    { view: 'recurring', label: 'Ricorrenti', icon: 'pi pi-refresh' },
    { view: 'search', label: 'Cerca', icon: 'pi pi-search' },
    { view: 'settings', label: 'Libreria', icon: 'pi pi-tags' },
  ];

  protected setView(view: AppView): void {
    this.store.setActiveView(view);
  }
}
