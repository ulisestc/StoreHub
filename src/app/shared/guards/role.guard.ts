import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();

  const expectedRoles: string[] = route.data['expectedRoles'];

  if (!userRole || !expectedRoles.includes(userRole)) {
    console.error('Acceso denegado. Rol requerido:', expectedRoles, 'Rol del usuario:', userRole);
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
