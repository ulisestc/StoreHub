import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../services/auth.service';

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
      nombre: new FormControl('', [Validators.required]),
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

    if (this.userRole === 'Admin') {
      this.profileForm.patchValue({
        nombre: 'Administrador Principal',
        email: 'admin@storehub.com'
      });
    } else if (this.userRole === 'Cajero') {
      this.profileForm.patchValue({
        nombre: 'Cajero de Turno',
        email: 'cajero@storehub.com'
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.snackBar.open('Perfil actualizado con éxito', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.profileForm.markAsPristine(); 
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      this.snackBar.open('Contraseña actualizada con éxito', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success']
      });
      this.passwordForm.reset();
      
      this.hideCurrent = true;
      this.hideNew = true;
      this.hideConfirm = true;
    }
  }
}