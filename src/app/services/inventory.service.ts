import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InventoryMovement } from '../shared/interfaces/inventory-movement';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http: HttpClient) { }

  getMovements(): Observable<InventoryMovement[]> {
    return this.http.get<InventoryMovement[]>(`${apiUrl}/inventory/`);
  }

  createMovement(movement: Omit<InventoryMovement, 'id' | 'fecha'>): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${apiUrl}/inventory/`, movement);
  }

  getMovementById(id: string): Observable<InventoryMovement> {
    return this.http.get<InventoryMovement>(`${apiUrl}/inventory/${id}/`);
  }
}
