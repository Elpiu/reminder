import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule],
  styleUrl: './app.css',
  template: `
    <div class="app">
      <h1>{{ title() }}</h1>
      <p-button label="Check" />
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {
  protected readonly title = signal('reminder');
}
