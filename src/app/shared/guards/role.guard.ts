import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Se obtiene el rol del usuario que está logueado
  const userRole = authService.getUserRole();

  // Se obtienen los roles permitidos para esta ruta.
  // Esto lo leemos desde la data de la ruta (lo configuramos en el siguiente paso)
  const expectedRoles: string[] = route.data['expectedRoles'];

  // Se verifica si hay un rol y si ese rol está en la lista de roles permitidos
  if (!userRole || !expectedRoles.includes(userRole)) {
    // Si no tiene el rol, se redirige al dashboard principal
    console.error('Acceso denegado. Rol requerido:', expectedRoles, 'Rol del usuario:', userRole);
    router.navigate(['/dashboard']);
    return false; // No puede pasar
  }

  // Si tiene el rol, sí puede pasar
  return true;
};
