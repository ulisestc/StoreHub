import { Component, inject, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  // Se inyectan los servicios
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  snackBar = inject(MatSnackBar);

  // Variables de estado
  loginError: boolean = false;
  hidePassword: boolean = true;
  isLoading: boolean = false;

  ngOnInit() {
    // Verificar si hay parámetro sessionExpired en la URL
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired'] === 'true') {
        this.snackBar.open('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['warning-snackbar']
        });
      }
    });
  }

  // Definición del FormGroup para el formulario
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  // Método que se llamará al enviar el formulario
  onSubmit() {
    // Se resetea el error
    this.loginError = false;

    if (this.loginForm.valid) {
      this.isLoading = true;
      const email = this.loginForm.value.email ?? '';
      const password = this.loginForm.value.password ?? '';

      // Llamar al servicio de login que ahora retorna un Observable
      this.authService.login(email, password).subscribe({
        next: (loginExitoso) => {
          console.log('📨 Respuesta del login:', loginExitoso);

          if (loginExitoso) {
            // ¡Éxito! Se redirige al Dashboard
            console.log('✅ Login exitoso, preparando navegación...');
            // Pequeño delay para asegurar que localStorage se actualizó
            setTimeout(() => {
              console.log('🚀 Navegando al dashboard...');
              this.router.navigate(['/dashboard']).then((navigated) => {
                console.log('🎯 Navegación completada:', navigated);
                this.isLoading = false;
              });
            }, 100);
          } else {
            // Error en las credenciales
            console.log('❌ Credenciales incorrectas');
            this.loginError = true;
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('❌ Error en el login:', error);
          this.loginError = true;
          this.isLoading = false;
        }
      });
    } else {
      // Marca todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
