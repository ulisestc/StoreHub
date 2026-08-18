import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Sale } from '../../shared/interfaces/sale';
import { SalesService } from '../../services/sales.service';
import { AuthService } from '../../services/auth.service';
import { EmailPromptModalComponent } from '../email-prompt-modal/email-prompt-modal.component';

@Component({
  selector: 'app-sale-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule,
    MatSnackBarModule
  ],
  templateUrl: './sale-detail-modal.component.html',
  styleUrl: './sale-detail-modal.component.scss'
})
export class SaleDetailModalComponent {

  displayedColumns: string[] = ['product_name', 'quantity', 'price', 'subtotal'];

  isSendingEmail: boolean = false;
  
  storeName: string | null = null;
  storeAddress: string | null = null;
  storePhone: string | null = null;
  storeReceiptMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SaleDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public sale: Sale,
    private salesService: SalesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.storeName = this.authService.getStoreName();
    this.storeAddress = this.authService.getStoreAddress();
    this.storePhone = this.authService.getStorePhone();
    this.storeReceiptMessage = this.authService.getStoreReceiptMessage();
  }

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

  sendEmail(): void {
    const dialogRef = this.dialog.open(EmailPromptModalComponent, {
      width: '450px',
      data: {
        saleId: this.sale.id,
        clientEmail: this.sale.client ? (this.sale.client as any).email : undefined
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      // If result is true, the email was sent successfully
    });
  }
}
