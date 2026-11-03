import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { SalesService } from '../../../../services/sales.service';
import { Sale } from '../../../../shared/interfaces/sale';
import { SaleDetailModalComponent } from '../../../../modals/sale-detail-modal/sale-detail-modal.component';

import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-sale-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './sale-history.component.html',
  styleUrl: './sale-history.component.scss'
})
export class SaleHistoryComponent implements OnInit {

  displayedColumns: string[] = ['created_at', 'id', 'client_name', 'payment_method', 'items', 'total', 'acciones'];
  dataSource: Sale[] = [];
  isLoading = false;
  pageSize = 10;
  currentPage = 0;
  totalSales = 0;

  private salesService = inject(SalesService);
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);

  currencyCode = this.authService.getStoreCurrencyCode();
  currencySymbol = this.authService.getStoreCurrencySymbol();

  ngOnInit(): void {
    this.currencyCode = this.authService.getStoreCurrencyCode();
    this.currencySymbol = this.authService.getStoreCurrencySymbol();
    this.loadSalesHistory();
  }

  loadSalesHistory(pageIndex: number = 0): void {
    this.isLoading = true;
    const backendPage = pageIndex + 1;

    this.salesService.getSalesHistoryPaginated(backendPage, this.pageSize).subscribe({
      next: (response) => {
        this.dataSource = [...response.results];
        this.totalSales = response.count;
        this.currentPage = pageIndex;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando historial de ventas:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.loadSalesHistory(event.pageIndex);
  }

  viewSaleDetails(sale: Sale): void {
    if (!sale.details || sale.details.length === 0) {
      alert('Esta venta no tiene detalles disponibles.');
      return;
    }

    this.dialog.open(SaleDetailModalComponent, {
      width: '700px',
      maxWidth: '95vw',
      data: sale,
      panelClass: 'sale-detail-dialog',
      autoFocus: false
    });
  }

  getTotalItems(sale: Sale): number {
    return sale.details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0;
  }

  shareWhatsApp(sale: Sale): void {
    const storeName = this.authService.getStoreName() || 'StoreHub';
    const symbol = this.currencySymbol || '$';
    const paymentMethodLabel = sale.payment_method === 'card' ? 'Tarjeta' : 'Efectivo';
    const dateStr = new Date(sale.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

    let lines: string[] = [];
    lines.push(`*COMPROBANTE DE VENTA*`);
    lines.push(`*${storeName}*`);
    lines.push(`Folio: #${sale.id}`);
    lines.push(`Fecha: ${dateStr}`);
    lines.push(`Método de pago: ${paymentMethodLabel}`);
    lines.push(`--------------------------------`);

    if (sale.details && sale.details.length > 0) {
      for (const d of sale.details) {
        const itemTotal = Number(d.price_at_sale) * Number(d.quantity);
        lines.push(`- ${d.quantity}x ${d.product_name} = ${symbol} ${itemTotal.toLocaleString('es-CO')}`);
      }
    }

    lines.push(`--------------------------------`);
    lines.push(`Subtotal: ${symbol} ${Number(sale.subtotal).toLocaleString('es-CO')}`);
    lines.push(`Impuestos: ${symbol} ${Number(sale.impuestos).toLocaleString('es-CO')}`);
    lines.push(`*TOTAL PAGADO: ${symbol} ${Number(sale.total).toLocaleString('es-CO')}*`);
    lines.push(`--------------------------------`);
    lines.push(`Gracias por su compra.`);

    const message = lines.join('\n');
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }
}
