import { Component, inject } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // Se inyectan los servicios
  authService = inject(AuthService);
  router = inject(Router);

  // (Variable para mostrar un mensaje de error)
  loginError: boolean = false;

  // Definición del FormGroup para el formulario
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  // Método que se llamará al enviar el formulario
  onSubmit() {
    // Se resetea el error
    this.loginError = false;

  if (this.loginForm.valid) {
      const email = this.loginForm.value.email ?? '';
      const password = this.loginForm.value.password ?? '';

      // Se llama al servicio de login
      const loginExitoso = this.authService.login(email, password);

      if (loginExitoso) {
        // ¡Éxito! Se redirige al Dashboard
        console.log('Login exitoso, redirigiendo...');
        this.router.navigate(['/dashboard']);
      } else {
        // Error en las credenciales
        console.log('Credenciales incorrectas');
        this.loginError = true;
      }
    }
  }
}
