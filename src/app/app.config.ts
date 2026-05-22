import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { definePreset } from '@primeuix/themes';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

const ReminderTheme = definePreset(Aura, {
  components: {
    datepicker: {
      panel: {
        background: '{surface.900}',
        borderColor: '{surface.700}',
        color: '{surface.0}',
      },
      header: {
        background: '{surface.900}',
        borderColor: '{surface.700}',
        color: '{surface.0}',
      },
      selectMonth: {
        color: '{surface.0}',
        hoverBackground: '{surface.800}',
        hoverColor: '{surface.0}',
      },
      selectYear: {
        color: '{surface.0}',
        hoverBackground: '{surface.800}',
        hoverColor: '{surface.0}',
      },
      weekDay: {
        color: '{surface.300}',
      },
      date: {
        color: '{surface.0}',
        hoverBackground: '{surface.800}',
        hoverColor: '{surface.0}',
        selectedBackground: '{primary.color}',
        selectedColor: '{primary.contrast.color}',
      },
      colorScheme: {
        light: {
          today: {
            background: '{primary.100}',
            color: '{primary.700}',
          },
        },
        dark: {
          today: {
            background: '{primary.color}',
            color: '{primary.contrast.color}',
          },
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {},
      },
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
