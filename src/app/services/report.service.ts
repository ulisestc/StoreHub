import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  // Simula la obtención de reportes. En el futuro, las fechas se usarán en el backend.
  getSalesReport(startDate?: Date, endDate?: Date): Observable<any> {

    // Simulación de datos (ignorando las fechas por ahora)
    const simulatedData = {
      totalIngresos: 12500.50,
      totalTransacciones: 82,
      topProducts: [
        { nombre: 'Laptop Pro 15"', vendidos: 15 },
        { nombre: 'Mouse Inalámbrico', vendidos: 30 },
        { nombre: 'Teclado Mecánico', vendidos: 20 }
      ]
    };

    return of(simulatedData);
  }
}
