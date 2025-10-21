import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  // Se inyectan los servicios necesarios
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se verifica si el usuario está logueado
  if (authService.isLoggedIn()) {
    return true; // Sí puede pasar
  } else {
    // No está logueado, se redirige al Login
    router.navigate(['/auth/login']);
    return false; // No puede pasar
  }
};
