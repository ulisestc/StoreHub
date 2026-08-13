import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreService } from '../../../services/store.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {
  setupForm: FormGroup;
  isLoading = false;
  userName = '';

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      receipt_message: [''],
      is_setup_complete: [true]
    });
  }

  ngOnInit(): void {
    this.userName = this.authService.getUserName() || 'Administrador';
    this.loadStoreConfig();
  }

  loadStoreConfig(): void {
    this.storeService.getStoreConfig().subscribe({
      next: (config) => {
        this.setupForm.patchValue({
          name: config.name,
          address: config.address,
          phone: config.phone,
          email: config.email,
          receipt_message: config.receipt_message
        });
      }
    });
  }

  onSave(): void {
    if (this.setupForm.invalid) return;

    this.isLoading = true;
    this.storeService.updateStoreConfig(this.setupForm.value).subscribe({
      next: () => {
        // Actualizar el token data localmente
        const tokenDataStr = localStorage.getItem('authTokenData');
        if (tokenDataStr) {
          const tokenData = JSON.parse(tokenDataStr);
          tokenData.isSetupComplete = true;
          localStorage.setItem('authTokenData', JSON.stringify(tokenData));
        }

        this.snackBar.open('¡Configuración completada con éxito!', 'Comenzar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
