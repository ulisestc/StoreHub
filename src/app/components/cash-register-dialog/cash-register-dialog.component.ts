import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { CashRegisterService, CashRegisterSession } from '../../services/cash-register.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface CashRegisterDialogData {
  session: CashRegisterSession | null;
}

@Component({
  selector: 'app-cash-register-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './cash-register-dialog.component.html',
  styleUrls: ['./cash-register-dialog.component.scss']
})
export class CashRegisterDialogComponent implements OnInit {
  isClosing: boolean = false;
  
  // Open fields
  openingBalance: number | null = null;
  openNotes: string = '';

  // Close fields
  actualClosingBalance: number | null = null;
  closeNotes: string = '';

  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CashRegisterDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CashRegisterDialogData,
    private cashRegisterService: CashRegisterService
  ) {}

  ngOnInit() {
    if (this.data.session) {
      this.isClosing = true;
      this.actualClosingBalance = this.data.session.expected_closing_balance || 0;
    } else {
      this.isClosing = false;
    }
  }

  onSubmit() {
    this.loading = true;
    if (this.isClosing && this.data.session) {
      this.cashRegisterService.closeSession(
        this.data.session.id, 
        this.actualClosingBalance || 0, 
        this.closeNotes
      ).subscribe({
        next: (res) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('Error closing session', err);
          this.loading = false;
        }
      });
    } else {
      this.cashRegisterService.openSession(
        this.openingBalance || 0,
        this.openNotes
      ).subscribe({
        next: (res) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('Error opening session', err);
          this.loading = false;
        }
      });
    }
  }
}
