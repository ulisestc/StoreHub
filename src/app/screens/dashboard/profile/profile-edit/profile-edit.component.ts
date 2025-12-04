import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, FormGroupDirective } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';
import { delay } from 'rxjs';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordsNotMatching: true });
    return { passwordsNotMatching: true };
  }
  return null;
}

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {

  @ViewChild('passwordFormDirective') passwordFormDirective!: FormGroupDirective;

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userRole: string | null = null;

  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.profileForm = new FormGroup({
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: passwordsMatchValidator });

    this.loadUserData();
  }

  loadUserData(): void {
    this.userRole = this.authService.getUserRole();

    this.authService.getUserProfile().subscribe({
      next: (user) => {
        this.profileForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.snackBar.open('Error al cargar datos del perfil', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const { first_name, last_name } = this.profileForm.value;

      this.authService.updateUserProfile({ first_name, last_name }).subscribe({
        next: () => {
          this.snackBar.open('Perfil actualizado con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          });
          this.profileForm.markAsPristine();
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          this.snackBar.open('Error al actualizar el perfil', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      });
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

      const passwordData = {
        new_password: newPassword,
        re_new_password: confirmPassword,
        current_password: currentPassword
      };

      this.authService.changePassword(passwordData).subscribe({
        next: () => {
          this.snackBar.open('Contraseña actualizada con éxito', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-success']
          }).afterDismissed().subscribe(() => {
            this.authService.logout();
          });

          this.passwordFormDirective.resetForm();

          this.hideCurrent = true;
          this.hideNew = true;
          this.hideConfirm = true;
        },
        error: (error) => {
          console.error('Error al cambiar contraseña:', error);
          this.snackBar.open('Error al cambiar la contraseña. Verifique su contraseña actual.', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error']
          });
        }
      }); 
    }
  }
}