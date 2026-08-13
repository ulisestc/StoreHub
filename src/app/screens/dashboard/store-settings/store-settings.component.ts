import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StoreService } from '../../../services/store.service';

@Component({
  selector: 'app-store-settings',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  templateUrl: './store-settings.component.html',
  styleUrls: ['./store-settings.component.scss']
})
export class StoreSettingsComponent implements OnInit {
  storeForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private snackBar: MatSnackBar
  ) {
    this.storeForm = this.fb.group({
      name: ['', Validators.required],
      address: [''],
      phone: [''],
      email: ['', [Validators.email]],
      receipt_message: ['']
    });
  }

  ngOnInit(): void {
    this.loadStoreConfig();
  }

  loadStoreConfig(): void {
    this.storeService.getStoreConfig().subscribe({
      next: (config) => {
        this.storeForm.patchValue({
          name: config.name,
          address: config.address,
          phone: config.phone,
          email: config.email,
          receipt_message: config.receipt_message
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar configuración de la tienda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onSave(): void {
    if (this.storeForm.invalid) return;

    this.isLoading = true;
    this.storeService.updateStoreConfig(this.storeForm.value).subscribe({
      next: () => {
        this.snackBar.open('Configuración guardada correctamente', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      },
      error: () => {
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }
}
