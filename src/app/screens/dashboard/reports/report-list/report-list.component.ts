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
    console.log(this.startDate, this.endDate);
    if (!this.startDate || !this.endDate) {
      alert('Por favor selecciona ambas fechas');
      return;
    }

    // pasar a YYYY-MM-DD
    console.log(this.startDate, this.endDate);
    const startStr = this.formatDate(this.startDate);
    const endStr = this.formatDate(this.endDate);
    //lamar
    this.fetchReport('sales-by-date', { start_date: startStr, end_date: endStr });
  }

  // 2. productos
  loadTopProducts() {
    console.log(this.limit);
    this.fetchReport('top-products', { limit: this.limit });
  }

  // 3. stcock
  loadLowStock() {
    console.log(this.threshold);
    this.fetchReport('low-stock-products', { threshold: this.threshold });
  }

  // metodo para llamar al servicioy y q funcionen los tres en uno solo
  private fetchReport(endpoint: string, params: any) {
    this.isLoading = true;
    this.reportHtml = null; // Limpiar reporte anterior

    this.reportService.getReportHtml(endpoint, params).subscribe({
      next: (htmlContent) => {
        // html sanitize
        this.reportHtml = this.sanitizer.bypassSecurityTrustHtml(htmlContent);
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
