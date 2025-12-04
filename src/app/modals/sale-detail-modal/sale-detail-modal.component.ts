import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { Sale } from '../../shared/interfaces/sale';

@Component({
  selector: 'app-sale-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule
  ],
  templateUrl: './sale-detail-modal.component.html',
  styleUrl: './sale-detail-modal.component.scss'
})
export class SaleDetailModalComponent {

  displayedColumns: string[] = ['product_name', 'quantity', 'price', 'subtotal'];

  constructor(
    public dialogRef: MatDialogRef<SaleDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public sale: Sale
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  getItemSubtotal(priceAtSale: string, quantity: number): number {
    return parseFloat(priceAtSale) * quantity;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
