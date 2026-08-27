import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { ReportService } from '../../../services/report.service';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CashRegisterService } from '../../../services/cash-register.service';
import { CashRegisterDialogComponent } from '../../../components/cash-register-dialog/cash-register-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  userRole: 'Admin' | 'Cajero' | null = null;
  userName: string = 'Usuario';

  salesToday: number = 0;
  transactionsToday: number = 0;
  totalProducts: number = 0;

  loadingSales: boolean = false;
  loadingProducts: boolean = false;
  
  isCashRegisterOpen: boolean = false;

  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private reportService = inject(ReportService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cashRegisterService = inject(CashRegisterService);

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();

    const realName = this.authService.getUserName();

    if (realName) {
      this.userName = realName;
    } else {
      this.userName = this.userRole === 'Admin' ? 'Administrador' : 'Cajero';
    }
    
    this.checkCashRegisterStatus();

    if (this.userRole === 'Admin') {
      this.loadDashboardMetrics();
    }
  }

  checkCashRegisterStatus(): void {
    this.cashRegisterService.getCurrentSession().subscribe({
      next: (session) => {
        this.isCashRegisterOpen = !!session;
      },
      error: () => {
        this.isCashRegisterOpen = false;
      }
    });
  }

  loadDashboardMetrics(): void {
    this.loadingProducts = true;
    this.productService.getProductsCount().subscribe({
      next: (count) => {
        this.totalProducts = count;
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error cargando total productos', err);
        this.loadingProducts = false;
      }
    });

    this.loadingSales = true;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    this.reportService.getSalesReport(todayStart, todayEnd).subscribe({
      next: (report) => {
        this.salesToday = report.total_ventas;
        this.transactionsToday = report.num_transacciones;
        this.loadingSales = false;
      },
      error: (err) => {
        console.error('Error cargando reporte de ventas', err);
        this.loadingSales = false;
      }
    });
  }

  openCashRegister(): void {
    this.cashRegisterService.getCurrentSession().subscribe({
      next: (session) => {
        const dialogRef = this.dialog.open(CashRegisterDialogComponent, {
          width: '500px',
          data: { session }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            const action = session ? 'cerrada' : 'abierta';
            this.snackBar.open(`Caja ${action} exitosamente`, 'Cerrar', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
            this.checkCashRegisterStatus();
          }
        });
      },
      error: (err) => {
        console.error('Error fetching current session', err);
        this.snackBar.open('Error al verificar estado de la caja', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
