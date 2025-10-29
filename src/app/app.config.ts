import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// Se importa lo necesario para HTTP y los interceptors
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './shared/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Se registra el proveedor de HttpClient
    //    y se le indica que use el interceptor
    provideHttpClient(
      withInterceptors([
        jwtInterceptor
      ])
    )
  ]
};
