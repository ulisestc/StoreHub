import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StoreConfig {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  receipt_message: string;
  is_premium: boolean;
  max_products: number;
  max_users: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly apiUrl = `${environment.apiUrl}/store/me/`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `JWT ${token}`
    });
  }

  getStoreConfig(): Observable<StoreConfig> {
    return this.http.get<StoreConfig>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateStoreConfig(data: Partial<StoreConfig>): Observable<StoreConfig> {
    return this.http.patch<StoreConfig>(this.apiUrl, data, { headers: this.getHeaders() });
  }
}
