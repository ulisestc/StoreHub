import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Sale } from '../shared/interfaces/sale';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  // Array para simular la base de datos de ventas
  private mockSales: Sale[] = [
    {
      id: '1678886400000',
      fecha: new Date('2025-03-15T10:00:00'),
      usuario: 'cajero@storehub.com',
      items: [ { nombre: 'Laptop Pro 15"', cantidad: 1, precio_venta: 1500 } ],
      total: 1500
    },
    {
      id: '1678972800000',
      fecha: new Date('2025-03-16T14:30:00'),
      usuario: 'admin@storehub.com',
      items: [ { nombre: 'Mouse Inalámbrico', cantidad: 2, precio_venta: 40 } ],
      total: 80
    }
  ];

  constructor() { }

  // Simula la creación de una venta
  createSale(items: any[], total: number): Observable<Sale> {
    console.log('Venta creada (simulado):', { items, total });

    const newSale: Sale = {
      id: new Date().getTime().toString(),
      fecha: new Date(),
      usuario: 'cajero@storehub.com', // Simulado, en el futuro tomar del AuthService
      items: items,
      total: total
    };

    this.mockSales.push(newSale); // Guarda la venta en el historial
    return of(newSale);
  }

  // Obtener el historial de ventas
  getSalesHistory(): Observable<Sale[]> {
    // Devuelve una copia ordenada por fecha (más nuevas primero)
    const sortedSales = [...this.mockSales].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    return of(sortedSales);
  }
}
