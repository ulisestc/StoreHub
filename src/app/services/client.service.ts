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
  
  // --- BORRAR ---
  deleteClient(id: string): Observable<boolean> {
    const index = this.mockClients.findIndex(c => c.id === id);
    if (index > -1) {
      this.mockClients.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // --- LEER UNO ---
  getClientById(id: string): Observable<Client | undefined> {
    const client = this.mockClients.find(c => c.id === id);
    return of(client);
  }

  // --- ACTUALIZAR ---
  updateClient(id: string, clientData: Client): Observable<Client | undefined> {
    const index = this.mockClients.findIndex(c => c.id === id);
    if (index > -1) {
      this.mockClients[index] = { ...clientData, id: id };
      return of(this.mockClients[index]);
    }
    return of(undefined);
  }
}
