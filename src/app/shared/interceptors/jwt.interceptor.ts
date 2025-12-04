import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const authToken = authService.getToken();

  let clonedReq = req;

  if (authToken) {
    clonedReq = req.clone({
      setHeaders: {
        Authorization: `JWT ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      switch (error.status) {
        case 401:
          console.warn('Error 401: Token inválido o expirado, intentando renovar...');

          if (error.url?.includes('/auth/jwt/refresh/')) {
            console.error('Refresh token inválido, cerrando sesión');
            handleUnauthorized(authService, router);
            return throwError(() => error);
          }

          return authService.refreshToken().pipe(
            switchMap(success => {
              if (success) {
                const newToken = authService.getToken();
                const retriedReq = req.clone({
                  setHeaders: {
                    Authorization: `JWT ${newToken}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log('Token renovado, reintentando petición...');
                return next(retriedReq);
              } else {
                handleUnauthorized(authService, router);
                return throwError(() => error);
              }
            }),
            catchError(refreshError => {
              handleUnauthorized(authService, router);
              return throwError(() => error);
            })
          );

        case 403:
          // Acceso prohibido (el usuario no tiene permisos)
          console.error('Error 403: Acceso prohibido. No tienes permisos para esta acción.');
          router.navigate(['/dashboard']);
          break;

        case 404:
          // Recurso no encontrado
          console.error('Error 404: Recurso no encontrado.');
          break;

        case 500:
          // Error del servidor
          console.error('Error 500: Error interno del servidor. Intenta más tarde.');
          break;

        case 503:
          // Servicio no disponible
          console.error('Error 503: Servicio no disponible. El servidor está temporalmente fuera de servicio.');
          break;

        case 0:
          // Error de red o CORS
          console.error('Error de red: No se pudo conectar con el servidor. Verifica tu conexión.');
          break;

        default:
          // Otros errores
          console.error(`Error HTTP ${error.status}: ${error.message}`);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Maneja el error 401 (No autorizado)
 * Cierra sesión y redirige al login
 */
function handleUnauthorized(authService: AuthService, router: Router): void {
  if (authService.isLoggedIn()) {
    authService.logout();

    console.warn('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');

    router.navigate(['/auth/login'], {
      queryParams: { sessionExpired: 'true' }
    });
  }
}
