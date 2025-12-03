import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale } from '../shared/interfaces/sale';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(private http: HttpClient) { }

  createSale(saleData: { items: any[], total: number, cliente?: string }): Observable<Sale> {
    return this.http.post<Sale>(`${apiUrl}/sales/`, saleData);
  }

  getSalesHistory(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${apiUrl}/sales/`);
  }

  getSaleById(id: string): Observable<Sale> {
    return this.http.get<Sale>(`${apiUrl}/sales/${id}/`);
  }
}
