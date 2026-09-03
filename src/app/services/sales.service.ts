import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sale } from '../shared/interfaces/sale';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

export interface CreateSaleData {
  client: string;
  details: Array<{
    product: string;
    quantity: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(private http: HttpClient) { }

  createSale(saleData: CreateSaleData): Observable<Sale> {
    return this.http.post<Sale>(`${apiUrl}/sales/`, saleData);
  }

  getSalesHistory(): Observable<Sale[]> {
    const isOfflineFlag = localStorage.getItem('storehub_is_offline') === 'true';
    if (!navigator.onLine || isOfflineFlag) {
      const cached = localStorage.getItem('storehub_offline_sales_history');
      return of(cached ? JSON.parse(cached) : []);
    }

    return this.http.get<any>(`${apiUrl}/sales/`).pipe(
      map(response => response.results || response)
    );
  }

  getSalesHistoryPaginated(page: number, pageSize: number = 10): Observable<{ count: number; results: Sale[] }> {
    const isOfflineFlag = localStorage.getItem('storehub_is_offline') === 'true';
    if (!navigator.onLine || isOfflineFlag) {
      const cached = localStorage.getItem('storehub_offline_sales_history');
      let sales: Sale[] = cached ? JSON.parse(cached) : [];

      const count = sales.length;
      const start = (page - 1) * pageSize;
      sales = sales.slice(start, start + pageSize);

      return of({ count, results: sales });
    }

    return this.http.get<{ count: number; results: Sale[] }>(`${apiUrl}/sales/?page=${page}&page_size=${pageSize}`);
  }

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${apiUrl}/sales/${id}/`);
  }

  bulkSync(sales: CreateSaleData[]): Observable<any> {
    return this.http.post<any>(`${apiUrl}/sales/bulk-sync/`, sales);
  }

  sendTicketEmail(saleId: number, email?: string): Observable<any> {
    const payload = email ? { email } : {};
    return this.http.post(`${apiUrl}/sales/${saleId}/send-ticket/`, payload);
  }
}
