import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

export interface SalesReportData {
  total_ventas: number;
  num_transacciones: number;
  atv: number;
  upt: number;
  loyalty_rate: number;
}

export interface InventoryValueData {
  capital_inmovilizado: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  getSalesReport(startDate?: Date, endDate?: Date): Observable<SalesReportData> {
    let params = new HttpParams();
    
    if (startDate && endDate) {
      // Format YYYY-MM-DD
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      params = params.append('start_date', startStr);
      params = params.append('end_date', endStr);
    } else {
      // Por defecto últimos 30 días si no mandan fecha
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      params = params.append('start_date', start.toISOString().split('T')[0]);
      params = params.append('end_date', end.toISOString().split('T')[0]);
    }

    return this.http.get<SalesReportData>(`${apiUrl}/reports/sales-by-date/`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching sales report from backend:', error);
        return of({
          total_ventas: 0,
          num_transacciones: 0,
          atv: 0,
          upt: 0,
          loyalty_rate: 0
        });
      })
    );
  }

  getTopProducts(limit: number = 10): Observable<any[]> {
    let params = new HttpParams().append('limit', limit.toString());
    return this.http.get<any[]>(`${apiUrl}/reports/top-products/`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching top products:', error);
        return of([]);
      })
    );
  }

  getInventoryReport(threshold: number = 10): Observable<any[]> {
    let params = new HttpParams().append('threshold', threshold.toString());
    return this.http.get<any[]>(`${apiUrl}/reports/low-stock-products/`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching low stock:', error);
        return of([]);
      })
    );
  }

  getInventoryValue(): Observable<InventoryValueData> {
    return this.http.get<InventoryValueData>(`${apiUrl}/reports/inventory-value/`).pipe(
      catchError(error => {
        console.error('Error fetching inventory value:', error);
        return of({ capital_inmovilizado: 0 });
      })
    );
  }

  getSalesHeatmap(): Observable<any[]> {
    return this.http.get<any[]>(`${apiUrl}/reports/sales-heatmap/`).pipe(
      catchError(error => {
        console.error('Error fetching heatmap:', error);
        return of([]);
      })
    );
  }

  // Exports
  exportFullReportToExcel(startDate?: Date, endDate?: Date): Observable<Blob> {
    let params = new HttpParams();
    if (startDate && endDate) {
      params = params.append('start_date', startDate.toISOString().split('T')[0]);
      params = params.append('end_date', endDate.toISOString().split('T')[0]);
    }
    return this.http.get(`${apiUrl}/export/full/`, { params, responseType: 'blob' });
  }

  getAvailableMonths(): Observable<string[]> {
    return this.http.get<string[]>(`${apiUrl}/analytics/available-months/`).pipe(
      catchError(error => {
        console.error('Error fetching available months:', error);
        return of([]);
      })
    );
  }
}
