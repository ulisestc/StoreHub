import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { SalesService } from '../../../../services/sales.service';
import { Sale } from '../../../../shared/interfaces/sale';
import { SaleDetailModalComponent } from '../../../../modals/sale-detail-modal/sale-detail-modal.component';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './sale-history.component.html',
  styleUrl: './sale-history.component.scss'
})
export class SaleHistoryComponent implements OnInit {

  displayedColumns: string[] = ['created_at', 'id', 'client_name', 'items', 'total', 'acciones'];
  dataSource: Sale[] = [];
  isLoading = false;

  private salesService = inject(SalesService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadSalesHistory();
  }

  loadSalesHistory(): void {
    this.isLoading = true;
    this.salesService.getSalesHistory().subscribe({
      next: (data) => {
        this.dataSource = [...data];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando historial de ventas:', error);
        this.isLoading = false;
      }
    });
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
      panelClass: 'sale-detail-dialog'
    });
  }

  getTotalItems(sale: Sale): number {
    return sale.details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0;
  }
}
