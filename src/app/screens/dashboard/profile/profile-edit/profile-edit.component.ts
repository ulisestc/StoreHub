import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

// Importaciones de Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

// Servicio
import { AuthService } from '../../../../services/auth.service';

export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    // Si no coinciden, marcamos el error en el control 'confirmPassword'
    confirmPassword.setErrors({ passwordsNotMatching: true });
    return { passwordsNotMatching: true };
  }

  // Si coinciden o los campos no existen, no hay error
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
    MatToolbarModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  userRole: string | null = null;

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    // Formulario de datos personales
    this.profileForm = new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    // Formulario de contraseña
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: passwordsMatchValidator });

    this.loadUserData();
  }

  // Simula la carga de datos del usuario logueado
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
      console.log('Datos de perfil actualizados (simulado):', this.profileForm.value);
      this.snackBar.open('Perfil actualizado con éxito', 'Cerrar', {
        duration: 3000
      });
    }
  }

  // Método para el submit del formulario de contraseña
  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      console.log('Contraseña actualizada (simulado):', this.passwordForm.value);
      this.snackBar.open('Contraseña actualizada con éxito', 'Cerrar', {
        duration: 3000
      });
      this.passwordForm.reset();
    } else {
      console.error('El formulario de contraseña es inválido');
    }
  }
}
