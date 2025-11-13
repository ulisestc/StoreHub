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
}
