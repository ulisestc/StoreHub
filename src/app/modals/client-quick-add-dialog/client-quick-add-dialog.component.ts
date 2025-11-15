import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

// Importaciones de Material
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

// Servicio
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-quick-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './client-quick-add-dialog.component.html',
  styleUrl: './client-quick-add-dialog.component.scss'
})
export class ClientQuickAddDialogComponent implements OnInit {

  clientForm!: FormGroup;
  private clientService = inject(ClientService);

  constructor(
    public dialogRef: MatDialogRef<ClientQuickAddDialogComponent>
  ) { }

  ngOnInit(): void {
    this.clientForm = new FormGroup({
      // Campos requeridos y opcionales según el documento
      nombre: new FormControl('', [Validators.required]),
      correo: new FormControl('', [Validators.email]),
      telefono: new FormControl(''),
    });
  }

  onCancel(): void {
    this.dialogRef.close(); // Cierra sin devolver nada
  }

  onSave(): void {
    if (this.clientForm.valid) {
      // Llama al servicio para crear el cliente
      this.clientService.createClient(this.clientForm.value).subscribe(newClient => {
        // Cierra el diálogo y devuelve el cliente recién creado
        this.dialogRef.close(newClient);
      });
    }
  }
}
