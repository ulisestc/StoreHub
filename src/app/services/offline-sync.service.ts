import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesService, CreateSaleData } from './sales.service';
import { ProductService } from './product.service';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root'
})
export class OfflineSyncService {

  private QUEUE_KEY = 'storehub_offline_sales';
  isOnline = new BehaviorSubject<boolean>(navigator.onLine);

  private salesService = inject(SalesService);
  private snackBar = inject(MatSnackBar);
  private productService = inject(ProductService);
  private clientService = inject(ClientService);

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline.next(true);
      this.syncPendingSales();
      this.syncOfflineCatalog();
    });

    window.addEventListener('offline', () => {
      this.isOnline.next(false);
    });
  }

  queueSale(sale: CreateSaleData): void {
    const pending = this.getPendingSales();
    pending.push(sale);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(pending));
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

    // Descargar hasta 10,000 productos para tenerlos disponibles offline
    this.productService.getProducts(undefined, undefined, 1, 10000).subscribe({
      next: (res) => {
        if (res && res.results) {
          localStorage.setItem('storehub_offline_catalog', JSON.stringify(res.results));
        }
      },
      error: (err) => console.error('Error sincronizando catálogo offline', err)
    });

    // Descargar últimos 500 registros de ventas
    this.salesService.getSalesHistoryPaginated(1, 500).subscribe({
      next: (res) => {
        if (res && res.results) {
          localStorage.setItem('storehub_offline_sales_history', JSON.stringify(res.results));
        }
      },
      error: (err) => console.error('Error sincronizando historial de ventas offline', err)
    });

    // Descargar clientes (hasta 10,000)
    this.clientService.getClients(1, 10000).subscribe({
      next: (res) => {
        if (res && res.results) {
          localStorage.setItem('storehub_offline_clients', JSON.stringify(res.results));
        }
      },
      error: (err) => console.error('Error sincronizando clientes offline', err)
    });
  }

  syncPendingSales(): void {
    const pending = this.getPendingSales();
    if (pending.length === 0 || !this.isOnline.value) {
      return;
    }

    this.salesService.bulkSync(pending).subscribe({
      next: () => {
        this.clearQueue();
        this.snackBar.open(
          `${pending.length} venta(s) sincronizada(s) exitosamente`,
          'Cerrar',
          { duration: 4000, panelClass: ['snackbar-success'] }
        );
      },
      error: () => {
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
