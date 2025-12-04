import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
    MatToolbarModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent implements OnInit {

  displayedColumns: string[] = ['name', 'email', 'phone', 'acciones'];
  dataSource: Client[] = [];
  allClients: Client[] = [];
  isLoading = false;

  totalClients = 0;
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50];

  private clientService = inject(ClientService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients(1, 1000).subscribe({
      next: (response) => {
        this.allClients = [...response.results];
        this.totalClients = this.allClients.length;
        this.updatePageData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  updatePageData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource = this.allClients.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePageData();
  }

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
        if (clientId === '1') {
          this.snackBar.open('No se puede eliminar al "Cliente Mostrador"', 'Cerrar', { duration: 3000 });
          return;
        }

        this.clientService.deleteClient(clientId).subscribe({
          next: () => {
            this.snackBar.open('Cliente eliminado exitosamente', 'Cerrar', { duration: 3000 });
            this.loadClients();
          },
          error: (error) => {
            console.error('Error eliminando cliente:', error);
            this.snackBar.open('Error al eliminar el cliente', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
