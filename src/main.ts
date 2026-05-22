import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err: unknown) => console.error(err));

if ('serviceWorker' in navigator && !isDevMode()) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error: unknown) => {
      console.warn('Service worker registration failed', error);
    });
  });
}

if ('serviceWorker' in navigator && isDevMode()) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      void registration.unregister();
    }
  });
}
