import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SalesService } from '../../services/sales.service';
import { PrinterService } from '../../services/printer.service';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface SaleSuccessData {
  saleId: number;
  clientEmail?: string;
  clientPhone?: string;
  sale?: any;
  ticketItems?: any[];
  subtotal?: number;
  iva?: number;
  total?: number;
  paymentMethod?: 'cash' | 'card';
  currencySymbol?: string;
  currencyCode?: string;
  taxName?: string;
  taxRate?: number;
}

@Component({
  selector: 'app-sale-success-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './sale-success-modal.component.html',
  styleUrls: ['./sale-success-modal.component.scss']
})
export class SaleSuccessModalComponent {
  emailForm: FormGroup;
  whatsappPhone: string = '';
  isSending: boolean = false;
  isSendingWhatsApp: boolean = false;

  isPrinterConnected$;

  constructor(
    public dialogRef: MatDialogRef<SaleSuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaleSuccessData,
    private fb: FormBuilder,
    private salesService: SalesService,
    private snackBar: MatSnackBar,
    private printerService: PrinterService,
    private authService: AuthService
  ) {
    this.isPrinterConnected$ = this.printerService.isConnected$;
    this.whatsappPhone = data.clientPhone || '';
    this.emailForm = this.fb.group({
      email: [data.clientEmail || '', [Validators.required, Validators.email]]
    });
  }

  private getFormattedPhone(): string {
    const rawPhone = (this.whatsappPhone || '').replace(/\D/g, '');
    if (!rawPhone || rawPhone.length < 7) return '';

    let finalPhone = rawPhone;
    const country = (this.authService.getStoreCountry() || '').toLowerCase();
    if (rawPhone.length === 10) {
      if (country.includes('colombia')) {
        finalPhone = '57' + rawPhone;
      } else if (country.includes('m') || country.includes('mex')) {
        finalPhone = '52' + rawPhone;
      } else if (country.includes('per')) {
        finalPhone = '51' + rawPhone;
      } else if (country.includes('chi')) {
        finalPhone = '56' + rawPhone;
      }
    }
    return finalPhone;
  }

  sendWhatsAppTicket(): void {
    const finalPhone = this.getFormattedPhone();
    if (!finalPhone) {
      this.snackBar.open('Por favor ingresa un número de teléfono válido para WhatsApp.', 'Cerrar', { duration: 3000 });
      return;
    }

    const storeName = this.authService.getStoreName() || 'StoreHub';
    const symbol = this.data.currencySymbol || this.authService.getStoreCurrencySymbol() || '$';
    const taxName = this.data.taxName || this.authService.getStoreTaxName() || 'IVA';
    const paymentMethodLabel = this.data.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo';
    const dateStr = new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

    let lines: string[] = [];
    lines.push(`*COMPROBANTE DE VENTA*`);
    lines.push(`*${storeName}*`);
    lines.push(`Folio: #${this.data.saleId}`);
    lines.push(`Fecha: ${dateStr}`);
    lines.push(`Método de pago: ${paymentMethodLabel}`);
    lines.push(`--------------------------------`);

    if (this.data.ticketItems && this.data.ticketItems.length > 0) {
      for (const item of this.data.ticketItems) {
        const itemTotal = (item.precio_venta * item.cantidad).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        lines.push(`- ${item.cantidad}x ${item.nombre} = ${symbol} ${itemTotal}`);
      }
    } else if (this.data.sale?.details) {
      for (const d of this.data.sale.details) {
        const itemTotal = (d.price_at_sale * d.quantity).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
        lines.push(`- ${d.quantity}x ${d.product_name} = ${symbol} ${itemTotal}`);
      }
    }

    lines.push(`--------------------------------`);
    if (this.data.subtotal !== undefined) {
      lines.push(`Subtotal: ${symbol} ${this.data.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
    }
    if (this.data.iva !== undefined) {
      lines.push(`${taxName}: ${symbol} ${this.data.iva.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);
    }
    const totalVal = this.data.total ?? this.data.sale?.total ?? 0;
    lines.push(`*TOTAL PAGADO: ${symbol} ${Number(totalVal).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}*`);
    lines.push(`--------------------------------`);
    lines.push(`Gracias por su compra.`);

    const message = lines.join('\n');
    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  }

  onClose(): void {
    this.dialogRef.close(true);
  }

  async printTicket(): Promise<void> {
    if (this.data.sale) {
      await this.printerService.printSaleTicket(this.data.sale);
    } else {
      this.snackBar.open('Error: Datos de la venta incompletos.', 'Cerrar', { duration: 3000 });
    }
  }

  sendEmail(): void {
    if (this.emailForm.invalid) return;

    this.isSending = true;
    const email = this.emailForm.value.email;

    this.salesService.sendTicketEmail(this.data.saleId, email).subscribe({
      next: () => {
        this.isSending = false;
        this.snackBar.open('¡Ticket enviado exitosamente!', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        // Remove this.dialogRef.close(true) so the user can still print
      },
      error: () => {
        this.isSending = false;
        this.snackBar.open('Error al enviar el ticket. Intenta de nuevo.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
