import { Component, inject, OnInit } from '@angular/core';

import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';

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

  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  snackBar = inject(MatSnackBar);
  loadingService = inject(LoadingService);

  loginError: boolean = false;
  hidePassword: boolean = true;
  isLoading: boolean = false;

  ngOnInit() {
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

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });
  onSubmit() {
    this.loginError = false;

    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loadingService.show();
      const email = this.loginForm.value.email ?? '';
      const password = this.loginForm.value.password ?? '';

      this.authService.login(email, password).subscribe({
        next: (loginExitoso) => {

          if (loginExitoso) {
            console.log('Login exitoso, navegando al dashboard...');
            this.router.navigate(['/dashboard']).then(() => {
              setTimeout(() => {
                this.loadingService.hide();
                this.isLoading = false;
              }, 400);
            });
          } else {
            this.loginError = true;
            this.isLoading = false;
            this.loadingService.hide();
          }
        },
        error: (error) => {
          console.error('❌ Error en el login:', error);
          this.loginError = true;
          this.isLoading = false;
          this.loadingService.hide();
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
