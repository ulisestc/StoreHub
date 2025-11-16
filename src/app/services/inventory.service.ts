import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InventoryMovement } from '../shared/interfaces/inventory-movement';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  // Datos simulados
  private mockMovements: InventoryMovement[] = [
    {
      id: '1',
      producto: 'Laptop Pro 15"',
      tipo_movimiento: 'entrada',
      cantidad: 10,
      usuario: 'admin@storehub.com',
      fecha: new Date('2025-10-20T10:00:00'),
      motivo: 'Compra inicial de stock'
    },
    {
      id: '2',
      producto: 'Mouse Inalámbrico',
      tipo_movimiento: 'merma',
      cantidad: 2,
      usuario: 'admin@storehub.com',
      fecha: new Date('2025-10-21T14:30:00'),
      motivo: 'Producto dañado en almacén'
    }
  ];

  constructor() { }

  // --- LEER TODOS LOS MOVIMIENTOS ---
  getMovements(): Observable<InventoryMovement[]> {
    return of(this.mockMovements);
  }

  // --- CREAR UN MOVIMIENTO (Simulado) ---
  createMovement(movement: Omit<InventoryMovement, 'id' | 'fecha'>): Observable<InventoryMovement> {
    const newMovement: InventoryMovement = {
      id: new Date().getTime().toString(),
      fecha: new Date(),
      ...movement
    };
    this.mockMovements.push(newMovement);
    return of(newMovement);
  }
}
