import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.get<any>(`${apiUrl}/sales/`).pipe(
      map(response => response.results || response)
    );
  }

  getSalesHistoryPaginated(page: number, pageSize: number = 10): Observable<{ count: number; results: Sale[] }> {
    return this.http.get<{ count: number; results: Sale[] }>(`${apiUrl}/sales/?page=${page}&page_size=${pageSize}`);
  }

  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${apiUrl}/sales/${id}/`);
  }
}
