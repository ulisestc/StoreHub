import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

interface TokenData {
  token: string;
  expiresAt: number;
  role: 'Admin' | 'Cajero';
}

interface LoginResponse {
  access: string;
  refresh: string;
}

interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'authToken';
  private readonly TOKEN_DATA_KEY = 'authTokenData';
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  /**
   * Login con el backend real
   */
  login(email: string, password: string): Observable<boolean> {
    console.log('Iniciando login para:', email);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/jwt/create/`, {
      email: email,
      password: password
    }).pipe(
      tap(response => console.log('Token recibido del servidor')),
      switchMap(response => {
        // Guardar token temporalmente
        localStorage.setItem(this.TOKEN_KEY, response.access);
        console.log('Token guardado temporalmente');

        // Hacer segunda llamada para obtener información del usuario
        // El interceptor agregará automáticamente el header Authorization
        return this.http.get<UserResponse>(`${this.apiUrl}/auth/users/me/`).pipe(
          tap(userInfo => {
            console.log('Información del usuario recibida:', userInfo);

            // Token expira en 8 horas
            const expiresAt = Date.now() + (8 * 60 * 60 * 1000);

            // Mapear el rol del backend al formato del frontend
            const role: 'Admin' | 'Cajero' = userInfo.role === 'admin' ? 'Admin' : 'Cajero';

            const tokenData: TokenData = {
              token: response.access,
              expiresAt: expiresAt,
              role: role
            };

            // Guardar token y datos en localStorage
            localStorage.setItem(this.TOKEN_KEY, response.access);
            localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));

            console.log('Login exitoso, usuario:', userInfo.email, 'rol:', role);
            console.log('Datos guardados en localStorage');
          }),
          switchMap(() => {
            console.log('Retornando true para indicar login exitoso');
            return of(true);
          })
        );
      }),
      catchError(error => {
        console.error('Error en login:', error);
        console.error('Detalles del error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        // Limpiar cualquier token que se haya guardado
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_DATA_KEY);
        return of(false);
      })
    );
  }  /**
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
    console.log('Verificando si está logueado. Token existe:', !!token);

    if (!token) {
      console.log('No hay token, usuario NO logueado');
      return false;
    }

    // Verificar si el token ha expirado
    if (this.isTokenExpired()) {
      console.log('Token expirado, cerrando sesión');
      this.logout();
      return false;
    }

    console.log('Usuario está logueado');
    return true;
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) {
      // Si no hay TOKEN_DATA pero sí hay TOKEN, asumir que es válido (recién logueado)
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        return false; // Asumir que es válido
      }
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
