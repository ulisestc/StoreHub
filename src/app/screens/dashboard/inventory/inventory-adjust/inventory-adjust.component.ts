import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';

// Servicio e Interfaz
import { InventoryService } from '../../../../services/inventory.service';
import { InventoryMovement } from '../../../../shared/interfaces/inventory-movement';

import { MatDialog } from '@angular/material/dialog'; // 1. Importa MatDialog
import { AdjustStockDialogComponent } from '../../../../modals/adjust-stock-dialog/adjust-stock-dialog.component'; // 2. Importa tu diálogo
import { AuthService } from '../../../../services/auth.service'; // 3. Importa AuthService

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

  displayedColumns: string[] = ['fecha', 'producto', 'tipo_movimiento', 'cantidad', 'usuario'];
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

  // PENDIENTE POR ARREGLAR: NO MUESTRA LOS COLORES
  // Función para dar color a los chips
  getChipColor(tipo: 'entrada' | 'salida' | 'merma'): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'entrada': return 'primary';
      case 'salida': return 'accent';
      case 'merma': return 'warn';
    }
  }

  // Método para abrir el diálogo
  openAdjustDialog(): void {
    const dialogRef = this.dialog.open(AdjustStockDialogComponent, {
      width: '450px',
    });

    // Se suscribe a lo que el diálogo devuelve al cerrarse
    dialogRef.afterClosed().subscribe(result => {
      // Si el usuario guardó (result no es nulo y tiene datos)
      if (result) {
        console.log('Datos del diálogo:', result);

        // Preparamos el objeto de movimiento
        const newMovement = {
          producto: result.producto,
          tipo_movimiento: result.tipo_movimiento,
          cantidad: result.cantidad,
          usuario: this.authService.getUserRole() ?? 'admin' // Obtenemos el usuario logueado
        };

        // Llamamos al servicio para crear
        this.inventoryService.createMovement(newMovement).subscribe(() => {
          console.log('Movimiento creado');
          this.loadMovements(); // Recargamos la tabla
        });
      }
    });
  }
}
