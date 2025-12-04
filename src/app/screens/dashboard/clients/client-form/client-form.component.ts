import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss'
})
export class ClientFormComponent implements OnInit {

  pageTitle: string = 'Crear Nuevo Cliente';
  isEditMode = false;
  isLoading = false;
  private currentClientId: string | null = null;

  clientForm!: FormGroup;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.clientForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl(''),
    });

    this.route.paramMap.subscribe(params => {
      this.currentClientId = params.get('id');
      if (this.currentClientId) {
        this.isEditMode = true;
        this.pageTitle = 'Editar Cliente';
        this.isLoading = true;

        this.clientService.getClientById(this.currentClientId).subscribe({
          next: (client) => {
            if (client) {
              this.clientForm.patchValue(client);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error cargando cliente:', error);
            this.snackBar.open('Error al cargar los datos del cliente', 'Cerrar', { duration: 3000 });
            this.isLoading = false;
            this.router.navigate(['/dashboard/clients']);
          }
        });
      }
    });
  }
  onSubmit(): void {
    if (this.clientForm.valid) {
      const clientData = this.clientForm.value;

      if (this.isEditMode && this.currentClientId) {
        this.clientService.updateClient(this.currentClientId, clientData)
          .subscribe({
            next: () => {
              this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', { duration: 3000 });
              this.router.navigate(['/dashboard/clients']);
            },
            error: (error) => {
              console.error('Error actualizando cliente:', error);
              this.snackBar.open('Error al actualizar el cliente', 'Cerrar', { duration: 3000 });
            }
          });

      } else {
        this.clientService.createClient(clientData)
          .subscribe({
            next: () => {
              this.snackBar.open('Cliente creado exitosamente', 'Cerrar', { duration: 3000 });
              this.router.navigate(['/dashboard/clients']);
            },
            error: (error) => {
              console.error('Error creando cliente:', error);
              this.snackBar.open('Error al crear el cliente', 'Cerrar', { duration: 3000 });
            }
          });
      }
    }
  } }
