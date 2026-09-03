import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Client } from '../shared/interfaces/client';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  getClients(page: number = 1, pageSize: number = 10): Observable<{count: number, results: Client[]}> {
    const serveFromCache = () => {
      const cached = localStorage.getItem('storehub_offline_clients');
      let clients: Client[] = cached ? JSON.parse(cached) : [];

      const count = clients.length;
      const start = (page - 1) * pageSize;
      clients = clients.slice(start, start + pageSize);

      return of({ count, results: clients });
    };

    const isOfflineFlag = localStorage.getItem('storehub_is_offline') === 'true';
    if (!navigator.onLine || isOfflineFlag) {
      return serveFromCache();
    }

    return this.http.get<any>(
      `${apiUrl}/clients/?page=${page}&page_size=${pageSize}`
    ).pipe(
      map(response => {
        if (response && response.results && Array.isArray(response.results)) {
          return {
            count: response.count || response.results.length,
            results: response.results
          };
        }
        if (Array.isArray(response)) {
          return {
            count: response.length,
            results: response
          };
        }
        return {
          count: 0,
          results: []
        };
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 || error.status === 502 || error.status === 504 || error.status === 500) {
          return serveFromCache();
        }
        return throwError(() => error);
      })
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${apiUrl}/clients/${id}/`);
  }

  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    return this.http.post<Client>(`${apiUrl}/clients/`, client);
  }

  updateClient(id: string, clientData: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${apiUrl}/clients/${id}/`, clientData);
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete(`${apiUrl}/clients/${id}/`);
  }
}
