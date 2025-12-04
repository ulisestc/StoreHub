import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  console.log('Auth Guard ejecutándose para ruta:', state.url);

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    console.log('Guard: Usuario autenticado, permitiendo acceso');
    return true;
  } else {
    console.log('Guard: Usuario NO autenticado, redirigiendo a login');
    router.navigate(['/auth/login']);
    return false;
  }
};
