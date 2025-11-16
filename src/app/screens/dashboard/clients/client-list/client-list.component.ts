import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importaciones de Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';

// Servicio y Diálogo
import { ClientService } from '../../../../services/client.service';
import { Client } from '../../../../shared/interfaces/client';
import { ConfirmDeleteModalComponent } from '../../../../modals/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'correo', 'telefono', 'acciones'];
  dataSource: Client[] = [];

  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe(data => {
      this.dataSource = [...data];
    });
  }

  // Método para abrir el diálogo de borrado
  openDeleteDialog(clientId: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteModalComponent, {
      width: '350px',
      data: {
        title: 'Confirmar Borrado',
        message: '¿Estás seguro de que deseas eliminar este cliente?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // No permitir borrar al "Cliente Mostrador" (simulación de regla de negocio)
        if (clientId === '1') {
          alert('No se puede eliminar al "Cliente Mostrador"');
          return;
        }

        this.clientService.deleteClient(clientId).subscribe(success => {
          if (success) {
            this.loadClients(); // Recargamos la lista
          }
        });
      }
    });
  }
}
