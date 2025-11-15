import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

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
  userRole: string | null = null;

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.profileForm = new FormGroup({
      // El documento menciona nombre, apellidos, correo
      // (Solo se usa nombre por simplicidad de la simulación)
      nombre: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

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
}
