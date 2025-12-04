import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { InventoryService } from '../../../../services/inventory.service';
import { InventoryMovement } from '../../../../shared/interfaces/inventory-movement';
import { MatDialog } from '@angular/material/dialog';
import { AdjustStockModalComponent } from '../../../../modals/adjust-stock-modal/adjust-stock-modal.component';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-inventory-adjust',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatChipsModule
  ],
  templateUrl: './inventory-adjust.component.html',
  styleUrl: './inventory-adjust.component.scss'
})
export class InventoryAdjustComponent implements OnInit {

  displayedColumns: string[] = ['created_at', 'product', 'type', 'quantity'];
  dataSource: InventoryMovement[] = [];

  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.inventoryService.getMovements().subscribe(data => {
      this.dataSource = [...data];
    });
  }

  getChipColor(tipo: 'in' | 'out' | 'loss'): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'in': return 'primary';
      case 'out': return 'accent';
      case 'loss': return 'warn';
    }
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
          reason: result.motivo,
          user: this.authService.getUserRole() ?? 'admin'
        };

        this.inventoryService.createMovement(newMovement).subscribe(() => {
          this.loadMovements();
        });
      }
    });
  }
}
