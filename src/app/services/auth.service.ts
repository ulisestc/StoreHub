import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface TokenData {
  token: string;
  expiresAt: number; // Timestamp de expiración
  role: 'Admin' | 'Cajero';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'authToken';
  private readonly TOKEN_DATA_KEY = 'authTokenData';

  constructor(private router: Router) { }

  /**
   * Simula el login y genera un token con expiración
   */
  login(email: string, password: string): boolean {

    let role: 'Admin' | 'Cajero' | null = null;
    let fakeToken = '';

    // Simulación de roles para las pruebas
    if (email === 'admin@storehub.com' && password === 'admin123') {
      role = 'Admin';
      fakeToken = 'FAKE_ADMIN_TOKEN_123456';
    } else if (email === 'cajero@storehub.com' && password === 'cajero123') {
      role = 'Cajero';
      fakeToken = 'FAKE_CAJERO_TOKEN_789012';
    }

    if (fakeToken && role) {
      // Token expira en 8 horas (simulación)
      const expiresAt = Date.now() + (8 * 60 * 60 * 1000);

      const tokenData: TokenData = {
        token: fakeToken,
        expiresAt: expiresAt,
        role: role
      };

      // Guardar token y datos en localStorage
      localStorage.setItem(this.TOKEN_KEY, fakeToken);
      localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));

      return true;
    }

    // Si las credenciales son incorrectas
    return false;
  }

  /**
   * Cierra sesión y limpia todos los datos almacenados
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_DATA_KEY);
    this.router.navigate(['/']);
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    // Verificar si el token ha expirado
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si el usuario está autenticado y el token es válido
   */
  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    // Verificar si el token ha expirado
    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) {
      return true; // Si no hay datos del token, considerarlo expirado
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();

      // Verificar si la fecha de expiración ya pasó
      return now >= tokenData.expiresAt;
    } catch (error) {
      console.error('Error al parsear datos del token:', error);
      return true; // En caso de error, considerar el token como expirado
    }
  }

  /**
   * Obtiene el tiempo restante hasta la expiración del token (en minutos)
   */
  getTokenExpirationTime(): number {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) return 0;

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();
      const timeRemaining = tokenData.expiresAt - now;

      // Convertir de milisegundos a minutos
      return Math.max(0, Math.floor(timeRemaining / (60 * 1000)));
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtiene el rol del usuario desde el token
   */
  getUserRole(): 'Admin' | 'Cajero' | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) {
      // Fallback a la lógica antigua para tokens sin datos estructurados
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return null;

      if (token.includes('FAKE_ADMIN_TOKEN')) {
        return 'Admin';
      } else if (token.includes('FAKE_CAJERO_TOKEN')) {
        return 'Cajero';
      }
      return null;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      return tokenData.role;
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: 'Admin' | 'Cajero'): boolean {
    return this.getUserRole() === role;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  /**
   * Verifica si el usuario es cajero
   */
  isCajero(): boolean {
    return this.hasRole('Cajero');
  }
}
