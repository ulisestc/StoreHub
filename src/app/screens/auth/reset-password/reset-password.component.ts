import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { FooterComponent } from '../../../partials/footer/footer.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule,
    FooterComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  hidePassword = true;
  hideConfirm = true;
  uid: string | null = null;
  token: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      re_new_password: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get('uid');
    this.token = this.route.snapshot.paramMap.get('token');

    if (!this.uid || !this.token) {
      this.snackBar.open('Enlace inválido o expirado.', 'Cerrar', { duration: 5000 });
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('new_password')?.value === g.get('re_new_password')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.uid || !this.token) return;

    this.isLoading = true;
    const { new_password, re_new_password } = this.resetForm.value;

    this.authService.confirmPasswordReset({
      uid: this.uid,
      token: this.token,
      new_password,
      re_new_password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: (err: any) => {
        this.isLoading = false;
        let msg = 'Error al cambiar la contraseña. El enlace puede haber expirado.';
        if (err.error?.new_password) msg = err.error.new_password[0];
        if (err.error?.non_field_errors) msg = err.error.non_field_errors[0];
        
        this.snackBar.open(msg, 'Entendido', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }
}
