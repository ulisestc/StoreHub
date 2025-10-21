import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) { }

  // --- Simulación de Login ---
  // Cuando se conecte con el backend, esto llamará a la API de Django
  login(email: string, password: string): boolean {

    let fakeToken = '';

    // Simulación de roles para las pruebas
    if (email === 'admin@storehub.com' && password === 'admin123') {
      // Se genera un token falso de "Admin"
      fakeToken = 'FAKE_ADMIN_TOKEN_123456';
    } else if (email === 'cajero@storehub.com' && password === 'cajero123') {
      // Se genera un token falso de "Cajero"
      fakeToken = 'FAKE_CAJERO_TOKEN_789012';
    }

    if (fakeToken) {
      // Si el login es exitoso, se guarda el token en localStorage
      localStorage.setItem('authToken', fakeToken);
      return true;
    }

    // Si las credenciales son incorrectas
    return false;
  }

  // --- Método para cerrar sesión ---
  logout(): void {
    // Se borra el token y se redirige al login
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth/login']);
  }

  // --- Método para obtener el token (lo usará el Interceptor) ---
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // --- Método para verificar si el usuario está logueado (lo usará el Guard) ---
  isLoggedIn(): boolean {
    // (doble negación) convierte un string (o null) en un booleano
    // Si hay un token, devuelve true. Si es null, devuelve false.
    return !!this.getToken();
  }
}
