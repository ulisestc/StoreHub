import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuditService, AuditLogEntry } from '../../../services/audit.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './audit-log.component.html',
  styleUrl: './audit-log.component.scss'
})
export class AuditLogComponent implements OnInit {
  private auditService = inject(AuditService);

  logs: AuditLogEntry[] = [];
  isLoading: boolean = false;

  selectedAction: string = '';
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';

  actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'PRECIO_CAMBIADO', label: 'Cambio de Precio' },
    { value: 'INVENTARIO_AJUSTADO', label: 'Ajuste de Inventario' },
    { value: 'PRODUCTO_CREADO', label: 'Producto Creado' },
    { value: 'PRODUCTO_ELIMINADO', label: 'Producto Eliminado' },
    { value: 'CAJA_ABIERTA', label: 'Apertura de Caja' },
    { value: 'CAJA_CERRADA', label: 'Cierre de Caja' },
    { value: 'GASTO_REGISTRADO', label: 'Gasto Registrado' },
    { value: 'GASTO_ELIMINADO', label: 'Gasto Eliminado' },
    { value: 'USUARIO_CREADO', label: 'Empleado Registrado' },
    { value: 'USUARIO_ELIMINADO', label: 'Empleado Eliminado' },
    { value: 'CONFIG_CAMBIADA', label: 'Configuración Modificada' }
  ];

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.auditService.getAuditLogs({
      action: this.selectedAction || undefined,
      search: this.searchQuery || undefined,
      start_date: this.startDate || undefined,
      end_date: this.endDate || undefined
    }).subscribe({
      next: (data) => {
        this.logs = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.logs = [];
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.selectedAction = '';
    this.searchQuery = '';
    this.startDate = '';
    this.endDate = '';
    this.loadLogs();
  }

  get priceAndStockChangesCount(): number {
    return this.logs.filter(l => l.action === 'PRECIO_CAMBIADO' || l.action === 'INVENTARIO_AJUSTADO').length;
  }

  get cashEventsCount(): number {
    return this.logs.filter(l => l.action === 'CAJA_ABIERTA' || l.action === 'CAJA_CERRADA').length;
  }

  get criticalDeletionsCount(): number {
    return this.logs.filter(l =>
      l.action === 'PRODUCTO_ELIMINADO' ||
      l.action === 'GASTO_ELIMINADO' ||
      l.action === 'USUARIO_ELIMINADO'
    ).length;
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'PRECIO_CAMBIADO': return 'sell';
      case 'INVENTARIO_AJUSTADO': return 'inventory';
      case 'PRODUCTO_CREADO': return 'add_box';
      case 'PRODUCTO_ELIMINADO': return 'delete_forever';
      case 'CAJA_ABIERTA': return 'lock_open';
      case 'CAJA_CERRADA': return 'lock';
      case 'GASTO_REGISTRADO': return 'receipt_long';
      case 'GASTO_ELIMINADO': return 'remove_circle_outline';
      case 'USUARIO_CREADO': return 'person_add';
      case 'USUARIO_ELIMINADO': return 'person_remove';
      case 'CONFIG_CAMBIADA': return 'tune';
      default: return 'shield';
    }
  }

  getActionSeverity(action: string): 'warning' | 'danger' | 'info' | 'success' {
    switch (action) {
      case 'PRODUCTO_ELIMINADO':
      case 'GASTO_ELIMINADO':
      case 'USUARIO_ELIMINADO':
        return 'danger';
      case 'PRECIO_CAMBIADO':
      case 'INVENTARIO_AJUSTADO':
      case 'CONFIG_CAMBIADA':
        return 'warning';
      case 'CAJA_ABIERTA':
      case 'PRODUCTO_CREADO':
      case 'USUARIO_CREADO':
        return 'success';
      default:
        return 'info';
    }
  }

  formatDataObject(data: Record<string, any> | null): { key: string; val: any }[] {
    if (!data) return [];
    return Object.entries(data)
      .filter(([_, val]) => val !== '' && val !== null && val !== undefined)
      .map(([key, val]) => ({ key: key.replace(/_/g, ' '), val }));
  }
}
