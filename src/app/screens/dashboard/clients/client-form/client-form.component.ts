import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

// Servicio
import { ClientService } from '../../../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {

  pageTitle: string = 'Crear Nuevo Cliente';
  isEditMode = false;
  private currentClientId: string | null = null;

  clientForm!: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);

  ngOnInit(): void {
    // Define el formulario con validaciones completas
    this.clientForm = new FormGroup({
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]),
      correo: new FormControl('', [
        Validators.email,
        Validators.maxLength(100)
      ]),
      telefono: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(15),
        Validators.pattern(/^[0-9+\-\s()]+$/)
      ]),
    });

    // Comprueba si es modo edición
    this.route.paramMap.subscribe(params => {
      this.currentClientId = params.get('id');
      if (this.currentClientId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Cliente';

        // Carga los datos del cliente
        this.clientService.getClientById(this.currentClientId).subscribe(client => {
          if (client) {
            this.clientForm.patchValue(client);
          }
        });
      }
    });
  }

  // Métodos helper para validaciones
  getErrorMessage(fieldName: string): string {
    const control = this.clientForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['email']) return 'Correo electrónico inválido';
    if (errors['pattern']) {
      if (fieldName === 'nombre') return 'Solo se permiten letras y espacios';
      if (fieldName === 'telefono') return 'Formato de teléfono inválido';
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const control = this.clientForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  onSubmit(): void {
    // Marcar todos los campos como touched
    Object.keys(this.clientForm.controls).forEach(key => {
      this.clientForm.get(key)?.markAsTouched();
    });

    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;

      if (this.isEditMode && this.currentClientId) {
        // --- Lógica de ACTUALIZAR (Simulada) ---
        console.log('Modo Edición. Datos:', clientData);
        this.clientService.updateClient(this.currentClientId, clientData)
          .subscribe(() => this.router.navigate(['/dashboard/clients']));

      } else {
        // --- Lógica de CREAR (Simulada) ---
        console.log('Modo Creación. Datos:', clientData);
        this.clientService.createClient(clientData)
          .subscribe(() => this.router.navigate(['/dashboard/clients']));
      }
    } else {
      console.log('Formulario inválido. Por favor, corrige los errores.');
    }
  }
}
