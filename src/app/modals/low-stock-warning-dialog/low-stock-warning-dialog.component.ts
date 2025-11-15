import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-low-stock-warning-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule
  ],
  templateUrl: './low-stock-warning-dialog.component.html',
  styleUrl: './low-stock-warning-dialog.component.scss'
})
export class LowStockWarningDialogComponent {

  // Recibimos un array de productos que tienen stock bajo
  constructor(
    public dialogRef: MatDialogRef<LowStockWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: any[] }
  ) { }

  onOkClick(): void {
    this.dialogRef.close();
  }
}
