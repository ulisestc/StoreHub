import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor() { }

  // Simula la creación de una venta
  createSale(items: any[], total: number): Observable<any> {
    console.log('Venta creada (simulado):', { items, total });

    // Simula una respuesta exitosa del backend
    const simulatedResponse = {
      id: new Date().getTime().toString(),
      fecha: new Date(),
      total: total,
      items: items
    };

    return of(simulatedResponse);
  }
}
