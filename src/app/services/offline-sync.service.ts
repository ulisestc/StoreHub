import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesService, CreateSaleData } from './sales.service';
import { ProductService } from './product.service';
import { ClientService } from './client.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { interval, Subscription } from 'rxjs';

const apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  private QUEUE_KEY = 'storehub_offline_sales';
  isOnline = new BehaviorSubject<boolean>(navigator.onLine);
  private isSyncing = false;

  private salesService = inject(SalesService);
  private snackBar = inject(MatSnackBar);
  private productService = inject(ProductService);
  private clientService = inject(ClientService);
  private http = inject(HttpClient);
  
  private heartbeatSub?: Subscription;

  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    this.startHeartbeat();

    // Sync catalog immediately on startup if we are online
    if (navigator.onLine) {
      this.syncOfflineCatalog();
    }
  }

  private handleOnline(): void {
    if (!this.isOnline.value) {
      this.isOnline.next(true);
      localStorage.setItem('storehub_is_offline', 'false');
      this.syncPendingSales();
      this.syncOfflineCatalog();
    }
  }

  private handleOffline(): void {
    if (this.isOnline.value) {
      this.isOnline.next(false);
      localStorage.setItem('storehub_is_offline', 'true');
    }
  }

  private startHeartbeat(): void {
    // Ping the server every 10 seconds to guarantee accurate online/offline state.
    // This bypasses the OS virtual network adapters bug during live presentations.
    // /api/health/ is a lightweight endpoint without DB queries — negligible Railway cost.
    this.heartbeatSub = interval(10000).subscribe(() => {
      // Pinging a lightweight endpoint.
      this.http.get(`${apiUrl}/health/`).subscribe({
        next: () => this.handleOnline(),
        error: (err) => {
          // Status 0 (network dead) or 504/502/500 (proxy gateway timeout when backend is dead locally)
          if (err.status === 0 || err.status === 504 || err.status === 502 || err.status === 500) {
            this.handleOffline();
          }
        }
      });
    });
  }

  queueSale(sale: CreateSaleData): void {
    const pending = this.getPendingSales();
    pending.push(sale);
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(pending));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.warn('LocalStorage lleno. Borrando catálogos offline para priorizar la venta...');
        localStorage.removeItem('storehub_offline_catalog');
        localStorage.removeItem('storehub_offline_clients');
        try {
          localStorage.setItem(this.QUEUE_KEY, JSON.stringify(pending));
        } catch (retryErr) {
          console.error('Memoria crítica: no se pudo guardar la venta offline.', retryErr);
        }
      }
    }
  }

  getPendingSales(): CreateSaleData[] {
    const data = localStorage.getItem(this.QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getPendingCount(): number {
    return this.getPendingSales().length;
  }

  syncOfflineCatalog(): void {
    if (!this.isOnline.value) return;

    const lastSyncStr = localStorage.getItem('storehub_last_catalog_sync');
    // Forzando sync en cada recarga para asegurar que se descarguen todos los productos
    // y arreglar el caché obsoleto que solo tenía 10 productos.

    localStorage.setItem('storehub_last_catalog_sync', Date.now().toString());

    // Descargar hasta 2,000 productos para tenerlos disponibles offline
    this.productService.getProducts(undefined, undefined, 1, 2000).subscribe({
      next: (res) => {
        if (res && res.results) {
          try {
            localStorage.setItem('storehub_offline_catalog', JSON.stringify(res.results));
          } catch(e) {
            console.warn('No hay espacio para guardar el catálogo completo.');
          }
        }
      },
      error: (err) => console.error('Error sincronizando catálogo offline', err)
    });

    // Descargar clientes (hasta 500)
    this.clientService.getClients(1, 500).subscribe({
      next: (res) => {
        if (res && res.results) {
          try {
            localStorage.setItem('storehub_offline_clients', JSON.stringify(res.results));
          } catch(e) {}
        }
      },
      error: (err) => console.error('Error sincronizando clientes offline', err)
    });
  }

  syncPendingSales(): void {
    const pending = this.getPendingSales();
    if (pending.length === 0 || !this.isOnline.value || this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    // Limpiar cola optimistamente para prevenir duplicados si el server procesa
    // pero la respuesta no llega (timeout de red)
    this.clearQueue();

    this.salesService.bulkSync(pending).subscribe({
      next: () => {
        this.isSyncing = false;
        this.snackBar.open(
          `${pending.length} venta(s) sincronizada(s) exitosamente`,
          'Cerrar',
          { duration: 4000, panelClass: ['snackbar-success'] }
        );
      },
      error: () => {
        this.isSyncing = false;
        // Restaurar la cola si el sync falló (server no procesó nada)
        try {
          const existing = this.getPendingSales();
          const restored = [...pending, ...existing];
          localStorage.setItem(this.QUEUE_KEY, JSON.stringify(restored));
        } catch(e) {
          console.error('Error restaurando cola de ventas offline', e);
        }
        this.snackBar.open(
          'Error al sincronizar ventas pendientes. Se reintentará automáticamente.',
          'Cerrar',
          { duration: 5000, panelClass: ['snackbar-error'] }
        );
      }
    });
  }

  clearQueue(): void {
    localStorage.removeItem(this.QUEUE_KEY);
  }
}
