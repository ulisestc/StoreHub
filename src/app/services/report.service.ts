import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  getSalesReport(startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('start_date', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params = params.set('end_date', endDate.toISOString().split('T')[0]);
    }

    return this.http.get<any>(`${apiUrl}/reports/sales-by-date/`, { params });
  }

  getInventoryReport(): Observable<any> {
    return this.http.get<any>(`${apiUrl}/reports/low-stock-products/`);
  }

  getTopProducts(limit: number = 10): Observable<any> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${apiUrl}/reports/top-products/`, { params });
  }
}
