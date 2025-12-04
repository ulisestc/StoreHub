import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SalesService } from '../../../../services/sales.service';
import { Sale } from '../../../../shared/interfaces/sale';

@Component({
  selector: 'app-sale-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './sale-history.component.html',
  styleUrl: './sale-history.component.scss'
})
export class SaleHistoryComponent implements OnInit {

  displayedColumns: string[] = ['created_at', 'id', 'client', 'total', 'acciones'];
  dataSource: Sale[] = [];

  private salesService = inject(SalesService);

  ngOnInit(): void {
    this.loadSalesHistory();
  }

  loadSalesHistory(): void {
    this.salesService.getSalesHistory().subscribe(data => {
      this.dataSource = [...data];
    });
  }

  viewSaleDetails(sale: Sale): void {
    alert(`Detalles de la Venta #${sale.id}\nTotal: ${sale.total}\nItems: ${sale.details?.length || 0}`);
  }
}
