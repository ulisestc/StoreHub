import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpenseService } from '../../../../services/expense.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-expense-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './expense-form-modal.component.html',
  styleUrls: ['./expense-form-modal.component.scss']
})
export class ExpenseFormModalComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ExpenseFormModalComponent>);
  private expenseService = inject(ExpenseService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  expenseForm: FormGroup;
  isSubmitting = false;
  currencySymbol = this.authService.getStoreCurrencySymbol();

  categories = [
    { value: 'services', label: 'Servicios Públicos (Luz, Agua, Internet)' },
    { value: 'rent', label: 'Arriendo / Renta de Local' },
    { value: 'payroll', label: 'Nómina / Sueldos y Jornales' },
    { value: 'supplies', label: 'Insumos, Empaque y Bolsas' },
    { value: 'maintenance', label: 'Mantenimiento y Aseo' },
    { value: 'transport', label: 'Transporte y Fletes' },
    { value: 'taxes', label: 'Impuestos y Trámites' },
    { value: 'other', label: 'Otros Gastos Operativos' }
  ];

  constructor() {
    const today = new Date().toISOString().split('T')[0];
    this.expenseForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['services', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [today, Validators.required],
      description: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) return;

    this.isSubmitting = true;
    this.expenseService.createExpense(this.expenseForm.value).subscribe({
      next: (created) => {
        this.snackBar.open('Gasto operativo registrado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
        this.dialogRef.close(created);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open('Error al registrar el gasto. Verifica los datos.', 'Cerrar', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }
}
