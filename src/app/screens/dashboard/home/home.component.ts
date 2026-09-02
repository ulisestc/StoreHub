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

import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CashRegisterService } from '../../../services/cash-register.service';
import { CashRegisterDialogComponent } from '../../../components/cash-register-dialog/cash-register-dialog.component';
import { Inject } from '@angular/core';

export interface DashboardWidget {
  id: string;
  icon: string;
  title: string;
  desc: string;
  route?: string;
  action?: string;
  roles: string[];
  active: boolean;
}

@Component({
  selector: 'app-widget-config-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCheckboxModule, MatDialogModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Personalizar Accesos</h2>
      <p class="dialog-subtitle">Selecciona los widgets que deseas ver en tu inicio.</p>
    </div>
    
    <mat-dialog-content>
      <div class="widget-grid">
        <div class="widget-item" 
             *ngFor="let w of data.widgets" 
             [class.active]="w.active"
             (click)="w.active = !w.active">
          
          <div class="widget-info">
            <div class="icon-box">
              <mat-icon>{{ w.icon }}</mat-icon>
            </div>
            <div class="text-info">
              <span class="title">{{ w.title }}</span>
              <span class="desc">{{ w.desc }}</span>
            </div>
          </div>

          <mat-checkbox [checked]="w.active" 
                        (change)="w.active = $event.checked" 
                        (click)="$event.stopPropagation()">
          </mat-checkbox>
        </div>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data.widgets">Guardar Cambios</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      padding: 24px 24px 8px;
      
      h2 {
        margin: 0 0 4px;
        color: var(--talavera-blue);
        font-weight: 700;
        font-size: 22px;
      }
      
      .dialog-subtitle {
        margin: 0;
        color: var(--talavera-muted);
        font-size: 14px;
      }
    }

    mat-dialog-content {
      padding: 0 24px 24px !important;
      overflow-y: auto;
    }

    .widget-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 16px;
      
      @media (min-width: 500px) {
        grid-template-columns: 1fr 1fr;
      }
    }

    .widget-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--talavera-surface);
      border: 1px solid var(--talavera-line);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(11, 47, 107, 0.02);
        border-color: rgba(11, 47, 107, 0.3);
      }

      &.active {
        border-color: var(--talavera-blue);
        background: rgba(11, 47, 107, 0.04);
        box-shadow: 0 4px 12px rgba(11, 47, 107, 0.08);
      }

      .widget-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .icon-box {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(11, 47, 107, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--talavera-blue);
        
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .text-info {
        display: flex;
        flex-direction: column;

        .title {
          font-weight: 600;
          color: var(--talavera-ink);
          font-size: 14px;
        }
        .desc {
          font-size: 12px;
          color: var(--talavera-muted);
        }
      }
    }

    .dialog-footer {
      padding: 16px 24px;
      margin-bottom: 0;
    }
  `]
})
export class WidgetConfigDialogComponent {
  data: { widgets: DashboardWidget[] } = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, FormsModule, MatIconModule],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>Exportar Reporte</h2>
      <p class="dialog-subtitle">Selecciona el periodo que deseas exportar a Excel.</p>
    </div>
    
    <mat-dialog-content>
      <div class="month-selector-container">
        <select [(ngModel)]="selectedMonth" class="custom-select">
          <option value="all">Todo el Histórico</option>
          <option *ngFor="let m of availableMonths" [value]="m.value">{{ m.label }}</option>
        </select>
      </div>
      
      <div class="info-note" *ngIf="selectedMonth === 'all'">
        <mat-icon>info</mat-icon>
        <p><strong>Nota:</strong> Las ventas y detalles abarcan toda la historia de la tienda. Los <strong>KPIs Financieros</strong> se calculan para los últimos 30 días. El <strong>Inventario</strong> muestra tu stock actual.</p>
      </div>

      <div class="info-note" *ngIf="selectedMonth !== 'all'">
        <mat-icon>info</mat-icon>
        <p><strong>Nota:</strong> Las ventas, detalles y <strong>KPIs Financieros</strong> corresponderán únicamente al mes seleccionado. El <strong>Inventario</strong> muestra tu stock actual.</p>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end" class="dialog-footer">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="selectedMonth">Descargar Excel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      padding: 24px 24px 16px;
      h2 { margin: 0 0 4px; color: var(--talavera-blue); font-weight: 700; font-size: 22px; }
      .dialog-subtitle { margin: 0; color: var(--talavera-muted); font-size: 14px; }
    }
    mat-dialog-content { padding: 0 24px 24px !important; }
    .month-selector-container {
      margin-top: 8px;
    }
    .custom-select {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid var(--talavera-line, #e2e8f0);
      border-radius: 8px;
      font-size: 16px;
      color: var(--talavera-ink, #1e293b);
      background-color: var(--talavera-surface, #fff);
      outline: none;
      cursor: pointer;
    }
    .custom-select:focus {
      border-color: var(--talavera-blue, #0b2f6b);
    }
    .info-note {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      padding: 12px 16px;
      background: rgba(11, 47, 107, 0.04);
      border-radius: 8px;
      border-left: 4px solid var(--talavera-blue, #0b2f6b);
      
      mat-icon {
        color: var(--talavera-blue, #0b2f6b);
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      p {
        margin: 0;
        font-size: 13px;
        color: var(--talavera-ink, #1e293b);
        line-height: 1.5;
      }
    }
    .dialog-footer { padding: 16px 24px; margin-bottom: 0; }
  `]
})
export class ExportDialogComponent implements OnInit {
  availableMonths: { value: string; label: string }[] = [];
  selectedMonth: string = 'all';

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.reportService.getAvailableMonths().subscribe(months => {
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      this.availableMonths = months.map(m => {
        const [year, monthStr] = m.split('-');
        const monthIndex = parseInt(monthStr, 10) - 1;
        return {
          value: m,
          label: `${monthNames[monthIndex]} ${year}`
        };
      });
      
      if (this.availableMonths.length > 0) {
        this.selectedMonth = this.availableMonths[0].value;
      }
    });
  }
}

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
  
  widgets: DashboardWidget[] = [
    { id: 'pos', icon: 'point_of_sale', title: 'Ir al POS', desc: 'Realizar cobro', route: '/dashboard/sales/pos', roles: ['Admin', 'Cajero'], active: true },
    { id: 'corte', icon: 'point_of_sale', title: 'Corte de Caja', desc: 'Apertura / Cierre', action: 'cash-register', roles: ['Admin', 'Cajero'], active: true },
    { id: 'products', icon: 'inventory_2', title: 'Productos', desc: 'Gestionar catálogo', route: '/dashboard/products', roles: ['Admin'], active: true },
    { id: 'clients', icon: 'people', title: 'Clientes', desc: 'Base de datos', route: '/dashboard/clients', roles: ['Admin'], active: true },
    { id: 'analytics', icon: 'insights', title: 'Analíticas', desc: 'Métricas clave', route: '/dashboard/analytics', roles: ['Admin'], active: true },
    { id: 'inventory', icon: 'calculate', title: 'Inventario', desc: 'Ajustes manuales', route: '/dashboard/inventory', roles: ['Admin'], active: true },
    { id: 'employees', icon: 'manage_accounts', title: 'Empleados', desc: 'Administrar cajeros', route: '/dashboard/employees', roles: ['Admin'], active: true },
    { id: 'settings', icon: 'settings', title: 'Configuración', desc: 'Ajustes del sistema', route: '/dashboard/settings', roles: ['Admin'], active: true },
    { id: 'export-full', icon: 'cloud_download', title: 'Exportar Reporte', desc: 'Descargar Excel Completo', action: 'export-full', roles: ['Admin'], active: true }
  ];

  activeWidgets: DashboardWidget[] = [];

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
    this.loadWidgets();

    if (this.userRole === 'Admin') {
      this.loadDashboardMetrics();
    }
  }

  loadWidgets(): void {
    // Filtrar por rol
    this.widgets = this.widgets.filter(w => w.roles.includes(this.userRole || ''));
    
    // Cargar de localstorage
    const saved = localStorage.getItem('storehub_widgets_' + (this.userRole || ''));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.widgets.forEach(w => {
          const savedWidget = parsed.find((p: any) => p.id === w.id);
          if (savedWidget) w.active = savedWidget.active;
        });
      } catch (e) {}
    }
    this.updateActiveWidgets();
  }

  updateActiveWidgets(): void {
    this.activeWidgets = this.widgets.filter(w => w.active);
  }

  openWidgetConfig(): void {
    const dialogRef = this.dialog.open(WidgetConfigDialogComponent, {
      width: '90vw',
      maxWidth: '650px',
      data: { widgets: JSON.parse(JSON.stringify(this.widgets)) }
    });

    dialogRef.afterClosed().subscribe((result: DashboardWidget[]) => {
      if (result) {
        this.widgets = result;
        this.updateActiveWidgets();
        localStorage.setItem('storehub_widgets_' + (this.userRole || ''), JSON.stringify(this.widgets));
        this.snackBar.open('Accesos rápidos actualizados', 'Cerrar', { duration: 3000 });
      }
    });
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
          width: '600px',
          data: { session }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
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

  executeAction(action: string): void {
    if (action === 'cash-register') {
      this.openCashRegister();
    } else if (action === 'export-full') {
      const dialogRef = this.dialog.open(ExportDialogComponent, { width: '400px' });
      
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          if (result === 'all') {
            this.downloadBlob(this.reportService.exportFullReportToExcel(), 'reporte_historico_storehub.xlsx');
          } else {
            const [year, month] = result.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59, 999);
            this.downloadBlob(this.reportService.exportFullReportToExcel(start, end), `reporte_${result}_storehub.xlsx`);
          }
        }
      });
    }
  }

  private downloadBlob(observable: import('rxjs').Observable<Blob>, filename: string): void {
    this.snackBar.open('Generando archivo Excel...', '', { duration: 2000 });
    observable.subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Archivo descargado con éxito', 'Cerrar', { duration: 3000, panelClass: 'success-snackbar' });
      },
      error: (err) => {
        console.error(`Error downloading ${filename}`, err);
        this.snackBar.open('Error al generar el archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
