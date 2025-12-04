import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-sale-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './confirm-sale-modal.component.html',
  styleUrl: './confirm-sale-modal.component.scss'
})
export class ConfirmSaleModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmSaleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { total: number }
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
