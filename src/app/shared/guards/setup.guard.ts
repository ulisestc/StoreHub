import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const setupGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Solo forzamos el setup para Administradores
  if (authService.isAdmin()) {
    if (!authService.isSetupComplete()) {
      return router.createUrlTree(['/dashboard/setup']);
    }
  }

  return true;
};
