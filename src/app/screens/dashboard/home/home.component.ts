import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  userRole: 'Admin' | 'Cajero' | null = null;
  userName: string = 'Usuario'; // Nombre simulado

  salesToday: number = 0;
  transactionsToday: number = 0;
  totalProducts: number | string = '--';

  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private reportService = inject(ReportService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    const realName = this.authService.getUserName();

    if (realName) {
      this.userName = realName;
    } else {
      this.userName = this.userRole === 'Admin' ? 'Administrador' : 'Cajero';
    }
    if (this.userRole === 'Admin') {
      this.loadDashboardMetrics();
    }
  }

  loadDashboardMetrics(): void {
    this.productService.getProductsCount().subscribe({
      next: (count) => this.totalProducts = count,
      error: (err) => console.error('Error cargando total productos', err)
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    this.reportService.getSalesReport(todayStart, todayEnd).subscribe({
      next: (report) => {
        this.salesToday = report.totalIngresos;
        this.transactionsToday = report.totalTransacciones;
      },
      error: (err) => console.error('Error cargando reporte de ventas', err)
    });
  }
}
