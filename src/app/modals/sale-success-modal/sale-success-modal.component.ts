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

export interface SaleSuccessData {
  saleId: number;
  clientEmail?: string;
  sale?: any;
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
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './sale-success-modal.component.html',
  styleUrls: ['./sale-success-modal.component.scss']
})
export class SaleSuccessModalComponent {
  emailForm: FormGroup;
  isSending: boolean = false;

  isPrinterConnected$;

  constructor(
    public dialogRef: MatDialogRef<SaleSuccessModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaleSuccessData,
    private fb: FormBuilder,
    private salesService: SalesService,
    private snackBar: MatSnackBar,
    private printerService: PrinterService
  ) {
    this.isPrinterConnected$ = this.printerService.isConnected$;
    this.emailForm = this.fb.group({
      email: [data.clientEmail || '', [Validators.required, Validators.email]]
    });
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
