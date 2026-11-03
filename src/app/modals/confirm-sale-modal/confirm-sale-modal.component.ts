import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-confirm-sale-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './confirm-sale-modal.component.html',
  styleUrl: './confirm-sale-modal.component.scss'
})
export class ConfirmSaleModalComponent {
  paymentMethod: 'cash' | 'card' = 'cash';
  cashReceived: number | null = null;
  currencyCode: string = 'COP';
  currencySymbol: string = '$';

  constructor(
    public dialogRef: MatDialogRef<ConfirmSaleModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { total: number },
    private authService: AuthService
  ) {
    this.currencyCode = this.authService.getStoreCurrencyCode();
    this.currencySymbol = this.authService.getStoreCurrencySymbol();
  }

  get change(): number {
    if (this.cashReceived === null || this.cashReceived === undefined || this.cashReceived < this.data.total) {
      return 0;
    }
    return this.cashReceived - this.data.total;
  }

  get isCashInsufficient(): boolean {
    return this.paymentMethod === 'cash' &&
      this.cashReceived !== null &&
      this.cashReceived !== undefined &&
      this.cashReceived > 0 &&
      this.cashReceived < this.data.total;
  }

  setPaymentMethod(method: 'cash' | 'card'): void {
    this.paymentMethod = method;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    if (this.isCashInsufficient) return;

    this.dialogRef.close({
      confirmed: true,
      payment_method: this.paymentMethod,
      cash_received: this.cashReceived,
      change: this.change
    });
  }
}
