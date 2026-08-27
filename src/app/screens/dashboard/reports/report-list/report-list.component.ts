import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReportService } from '../../../../services/report.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-report-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent {

  // Inyecciones
  private reportService = inject(ReportService);
  private sanitizer = inject(DomSanitizer);

  // filtros
  startDate: Date | null = null;
  endDate: Date | null = null;
  limit: number = 10;
  threshold: number = 10;

  // se guarda html como safehtml
  reportHtml: SafeHtml | null = null;
  isLoading = false;

  // 1. fecha
  loadSalesByDate() {
    if (!this.startDate || !this.endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }
    this.isLoading = true;
    this.reportHtml = null;
    this.reportService.getSalesReport(this.startDate, this.endDate).subscribe({
      next: (data) => {
        const html = `
          <h2>Reporte de Ventas</h2>
          <p><strong>Ventas Totales:</strong> $${data.total_ventas}</p>
          <p><strong>Transacciones:</strong> ${data.num_transacciones}</p>
          <p><strong>ATV (Ticket Promedio):</strong> $${data.atv}</p>
          <p><strong>UPT (Unidades por Transacción):</strong> ${data.upt}</p>
          <p><strong>Tasa de Lealtad:</strong> ${data.loyalty_rate}%</p>
        `;
        this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando reporte:', err);
        this.isLoading = false;
        alert('Error al cargar el reporte. Revisa la consola.');
      }
    });
  }

  // 2. productos
  loadTopProducts() {
    this.isLoading = true;
    this.reportHtml = null;
    this.reportService.getTopProducts(this.limit).subscribe({
      next: (data) => {
        let html = `<h2>Top ${this.limit} Productos</h2><ul>`;
        data.forEach(p => {
          html += `<li>${p.product__name}: ${p.total_qty} unidades</li>`;
        });
        html += `</ul>`;
        this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando reporte:', err);
        this.isLoading = false;
        alert('Error al cargar el reporte. Revisa la consola.');
      }
    });
  }

  // 3. stcock
  loadLowStock() {
    this.isLoading = true;
    this.reportHtml = null;
    this.reportService.getInventoryReport(this.threshold).subscribe({
      next: (data) => {
        let html = `<h2>Stock Bajo (Menos de ${this.threshold})</h2><ul>`;
        data.forEach(p => {
          html += `<li>${p.name}: ${p.stock} en inventario</li>`;
        });
        html += `</ul>`;
        this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(html);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando reporte:', err);
        this.isLoading = false;
        alert('Error al cargar el reporte. Revisa la consola.');
      }
    });
  }

  //  pasar a YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
