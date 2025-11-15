import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Client } from '../shared/interfaces/client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  // Datos simulados
  private mockClients: Client[] = [
    { id: '1', nombre: 'Cliente Mostrador (Público General)', correo: '', telefono: '' },
    { id: '2', nombre: 'Juan Pérez', correo: 'juan@email.com', telefono: '123456789' }
  ];

  constructor() { }

  // --- LEER TODOS ---
  getClients(): Observable<Client[]> {
    return of(this.mockClients);
  }

  // --- CREAR (Simulado) ---
  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    const newClient: Client = {
      id: new Date().getTime().toString(),
      ...client
    };
    this.mockClients.push(newClient);
    return of(newClient);
  }
}
