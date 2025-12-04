import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client } from '../shared/interfaces/client';
import { environment } from '../../environments/environment';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private http: HttpClient) { }

  getClients(): Observable<Client[]> {
    return this.http.get<any>(`${apiUrl}/clients/`).pipe(
      map(response => response.results || response)
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
