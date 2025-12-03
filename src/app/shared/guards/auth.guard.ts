import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  console.log('🛡️ Auth Guard ejecutándose para ruta:', state.url);

  // Se inyectan los servicios necesarios
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se verifica si el usuario está logueado
  if (authService.isLoggedIn()) {
    console.log('✅ Guard: Usuario autenticado, permitiendo acceso');
    return true; // Sí puede pasar
  } else {
    // No está logueado, se redirige al Login
    console.log('❌ Guard: Usuario NO autenticado, redirigiendo a login');
    router.navigate(['/auth/login']);
    return false; // No puede pasar
  }
};
