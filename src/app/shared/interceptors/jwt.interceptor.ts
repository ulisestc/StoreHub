import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  // Se inyecta el servicio de autenticación
  const authService = inject(AuthService);

  // Se obtiene el token
  const authToken = authService.getToken();

  // Se verifica si tenemos un token
  if (authToken) {
    // Si hay token, se clona la petición y se le añade la cabecera
    // 'Authorization' con el 'Bearer token'.
    // El backend (Django) esperará esta cabecera.
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    // Dejamos que la petición clonada (y modificada) continúe
    return next(clonedReq);
  }

  // Si no hay token, dejamos que la petición original continúe
  // (esto es para peticiones públicas como Login o Registro)
  return next(req);
};
