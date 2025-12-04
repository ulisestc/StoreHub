import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InventoryService } from '../../../../services/inventory.service';
import { InventoryMovement } from '../../../../shared/interfaces/inventory-movement';
import { MatDialog } from '@angular/material/dialog';
import { AdjustStockModalComponent } from '../../../../modals/adjust-stock-modal/adjust-stock-modal.component';
import { AuthService } from '../../../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inventory-adjust',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './inventory-adjust.component.html',
  styleUrl: './inventory-adjust.component.scss'
})
export class InventoryAdjustComponent implements OnInit {

  displayedColumns: string[] = ['timestamp', 'product', 'type', 'quantity'];
  dataSource: InventoryMovement[] = [];
  isLoading = false;

  totalItems = 0;
  pageSize = 10;
  currentPage = 0;

  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(pageIndex: number = 0): void {
    this.isLoading = true;
    const backendPage = pageIndex + 1;

    this.inventoryService.getMovements(backendPage).subscribe({
      next: (response) => {
        this.dataSource = response.results;
        this.totalItems = response.count;
        this.currentPage = pageIndex;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando movimientos:', error);
        this.isLoading = false;
      }
    });
  }

  getChipColor(tipo: 'in' | 'out' | 'loss'): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'in': return 'primary';
      case 'out': return 'accent';
      case 'loss': return 'warn';
    }
  }

  onPageChange(event: PageEvent): void {
    this.loadMovements(event.pageIndex);
  }
  openAdjustDialog(): void {
    const dialogRef = this.dialog.open(AdjustStockModalComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newMovement = {
          product: result.producto,
          type: result.tipo_movimiento,
          quantity: result.cantidad,
          user: this.authService.getUserRole() ?? 'admin'
        };

        this.inventoryService.createMovement(newMovement).subscribe({
          next: () => {
            this.snackBar.open('Ajuste registrado correctamente', 'Cerrar', { duration: 3000 });
            this.loadMovements(0);
          },
          error: (err) => {
            console.error(err);
            this.snackBar.open('Error al registrar ajuste', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }
}
