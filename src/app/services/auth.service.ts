import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: number;
  role: 'Admin' | 'Cajero';
  name: string;
  mustChangePassword?: boolean;
  isSetupComplete?: boolean;
}

interface LoginResponse {
  access: string;
  refresh: string;
}

export interface Store {
  id: number;
  name: string;
  is_premium: boolean;
  max_products: number;
  max_users: number;
  is_setup_complete?: boolean;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  must_change_password?: boolean;
  store: Store;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly TOKEN_DATA_KEY = 'authTokenData';
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  login(email: string, password: string): Observable<boolean> {
    console.log('Iniciando login para:', email);

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/jwt/create/`, {
      email: email,
      password: password
    }).pipe(
      tap(response => console.log('Token recibido del servidor')),
      switchMap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.access);
        console.log('Token guardado temporalmente');

        return this.http.get<UserResponse>(`${this.apiUrl}/auth/users/me/`).pipe(
          tap(userInfo => {
            console.log('Información del usuario recibida:', userInfo);

            const expiresAt = Date.now() + (8 * 60 * 60 * 1000);
            const role: 'Admin' | 'Cajero' = userInfo.role === 'admin' ? 'Admin' : 'Cajero';

            const tokenData: TokenData = {
              token: response.access,
              refreshToken: response.refresh,
              expiresAt: expiresAt,
              role: role,
              name: `${userInfo.first_name} ${userInfo.last_name}`,
              mustChangePassword: userInfo.must_change_password,
              isSetupComplete: userInfo.store?.is_setup_complete
            };

            localStorage.setItem(this.TOKEN_KEY, response.access);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh);
            localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));

            console.log('Login exitoso, usuario:', userInfo.email, 'rol:', role);
            
            // Lógica de redirección basada en estado de setup o contraseña
            setTimeout(() => {
              if (userInfo.must_change_password) {
                this.router.navigate(['/auth/force-change-password']);
              } else {
                this.router.navigate(['/dashboard']);
              }
            }, 400);
          }),
          switchMap(() => of(true))
        );
      }),
      catchError(error => {
        console.error('Error en login:', error);
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_DATA_KEY);
        return of(false);
      })
    );
  }

  register(userData: RegisterData): Observable<any> {
    console.log('Registrando usuario:', userData.email);

    return this.http.post(`${this.apiUrl}/auth/users/`, userData).pipe(
      tap(() => console.log('Registro exitoso')),
      catchError(error => {
        console.error('Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      console.log('No hay refresh token disponible');
      return of(false);
    }

    console.log('Renovando token...');

    return this.http.post<{ access: string }>(`${this.apiUrl}/auth/jwt/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        const newExpiresAt = Date.now() + (8 * 60 * 60 * 1000);
        localStorage.setItem(this.TOKEN_KEY, response.access);

        const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
        if (tokenDataStr) {
          const tokenData: TokenData = JSON.parse(tokenDataStr);
          tokenData.token = response.access;
          tokenData.expiresAt = newExpiresAt;
          localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));
        }
      }),
      switchMap(() => of(true)),
      catchError(error => {
        console.error('Error al renovar token:', error);
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_DATA_KEY);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (!token) {
      return null;
    }

    if (this.isTokenExpired()) {
      return token;
    }

    const timeRemaining = this.getTokenExpirationTime();
    if (timeRemaining < 30 && timeRemaining > 0) {
      this.refreshToken().subscribe();
    }

    return token;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);

    if (!token) {
      return false;
    }

    if (this.isTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  isTokenExpired(): boolean {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token) {
        return false;
      }
      return true;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();
      return now >= tokenData.expiresAt;
    } catch (error) {
      return true;
    }
  }

  getTokenExpirationTime(): number {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) return 0;

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      const now = Date.now();
      const timeRemaining = tokenData.expiresAt - now;
      return Math.max(0, Math.floor(timeRemaining / (60 * 1000)));
    } catch (error) {
      return 0;
    }
  }

  getUserName(): string | null {
    if (!this.isLoggedIn()) {
      return null;
    }
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
    if (!tokenDataStr) {
      return null;
    }
    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      return tokenData.name || null;
    } catch (error) {
      return null;
    }
  }

  getUserRole(): 'Admin' | 'Cajero' | null {
    if (!this.isLoggedIn()) {
      return null;
    }

    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);

    if (!tokenDataStr) {
      return null;
    }

    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      return tokenData.role;
    } catch (error) {
      return null;
    }
  }

  isSetupComplete(): boolean {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
    if (!tokenDataStr) return false;
    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      return tokenData.isSetupComplete ?? true; // Default true para evitar bloqueos si falla
    } catch {
      return true;
    }
  }

  mustChangePassword(): boolean {
    const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
    if (!tokenDataStr) return false;
    try {
      const tokenData: TokenData = JSON.parse(tokenDataStr);
      return tokenData.mustChangePassword ?? false;
    } catch {
      return false;
    }
  }

  hasRole(role: 'Admin' | 'Cajero'): boolean {
    return this.getUserRole() === role;
  }

  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  isCajero(): boolean {
    return this.hasRole('Cajero');
  }

  getUserProfile(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/auth/users/me/`);
  }

  updateUserProfile(data: { first_name: string; last_name: string }): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.apiUrl}/auth/users/me/`, data);
  }

  changePassword(data: { new_password: string; re_new_password: string; current_password: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/users/set_password/`, data);
  }

  sendPasswordResetEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/users/reset_password/`, { email });
  }

  confirmPasswordReset(data: { uid: string; token: string; new_password: string; re_new_password: string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/users/reset_password_confirm/`, data);
  }

  forceChangePassword(data: { new_password: string; re_new_password: string; current_password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/users/force_change_password/`, data).pipe(
      tap(() => {
        // Actualizar el token data para quitar el flag
        const tokenDataStr = localStorage.getItem(this.TOKEN_DATA_KEY);
        if (tokenDataStr) {
          const tokenData: TokenData = JSON.parse(tokenDataStr);
          tokenData.mustChangePassword = false;
          localStorage.setItem(this.TOKEN_DATA_KEY, JSON.stringify(tokenData));
        }
      })
    );
  }
}
