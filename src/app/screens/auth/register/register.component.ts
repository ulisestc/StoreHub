import { Component, inject } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  authService = inject(AuthService);
  router = inject(Router);

  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;
  registerError: string = '';
  registerSuccess: boolean = false;

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  registerForm = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    apellidos: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(20)
    ]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator.bind(this) });

  onSubmit() {
    this.registerError = '';
    this.registerSuccess = false;

    if (this.registerForm.valid) {
      this.isLoading = true;

      const formValue = this.registerForm.value;

      const registerPayload = {
        email: formValue.email!,
        password: formValue.password!,
        first_name: formValue.nombre!,
        last_name: formValue.apellidos!
      };

      this.authService.register(registerPayload).subscribe({
        next: () => {
          this.isLoading = false;
          this.registerSuccess = true;

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error desde componente:', err);

          if (err.status === 400) {
            if (err.error?.email) {
              this.registerError = 'Este correo electrónico ya está registrado.';
            } else if (err.error?.password) {
              this.registerError = 'La contraseña es muy común o inválida.';
            } else {
              this.registerError = 'Datos inválidos. Verifica la información.';
            }
          } else {
            this.registerError = 'Ocurrió un error en el servidor. Intenta más tarde.';
          }
        }
      });

    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
