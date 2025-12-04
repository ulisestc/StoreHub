import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InventoryResponse, InventoryMovement } from '../shared/interfaces/inventory-movement';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }

  getMovements(page: number = 1): Observable<InventoryResponse> {
    let params = new HttpParams().set('page', page.toString());

    return this.http.get<InventoryResponse>(`${apiUrl}/inventory/`, { params });
  }

  createMovement(movement: { product: string, type: string, quantity: number }): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${apiUrl}/inventory/`, movement);
  }

  getMovementById(id: string): Observable<InventoryMovement> {
    return this.http.get<InventoryMovement>(`${apiUrl}/inventory/${id}/`);
  }
}
