import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseService, Expense, ExpenseSummary } from '../../../../services/expense.service';
import { AuthService } from '../../../../services/auth.service';
import { ExpenseFormModalComponent } from '../expense-form-modal/expense-form-modal.component';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  expenses: Expense[] = [];
  summary: ExpenseSummary | null = null;
  isLoading = false;

  currencyCode = this.authService.getStoreCurrencyCode();
  currencySymbol = this.authService.getStoreCurrencySymbol();

  displayedColumns: string[] = ['date', 'title', 'category', 'amount', 'user', 'actions'];

  selectedCategory: string = '';
  startDate: string = '';
  endDate: string = '';

  categories = [
    { value: '', label: 'Todas las categorías' },
    { value: 'services', label: 'Servicios Públicos' },
    { value: 'rent', label: 'Arriendo / Renta' },
    { value: 'payroll', label: 'Nómina / Sueldos' },
    { value: 'supplies', label: 'Insumos y Empaques' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'transport', label: 'Transporte y Fletes' },
    { value: 'taxes', label: 'Impuestos y Trámites' },
    { value: 'other', label: 'Otros Gastos' }
  ];

  ngOnInit(): void {
    this.currencyCode = this.authService.getStoreCurrencyCode();
    this.currencySymbol = this.authService.getStoreCurrencySymbol();
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const filters: any = {};
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.startDate) filters.start_date = this.startDate;
    if (this.endDate) filters.end_date = this.endDate;

    this.expenseService.getExpenses(filters).subscribe({
      next: (res) => {
        this.expenses = Array.isArray(res) ? res : (res.results || []);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al cargar la bitácora de gastos', 'Cerrar', { duration: 3000 });
      }
    });

    this.expenseService.getSummary().subscribe({
      next: (summary) => this.summary = summary,
      error: () => console.warn('No se pudo cargar el resumen de gastos')
    });
  }

  onFilterChange(): void {
    this.loadData();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.startDate = '';
    this.endDate = '';
    this.loadData();
  }

  openCreateModal(): void {
    const dialogRef = this.dialog.open(ExpenseFormModalComponent, {
      width: '550px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadData();
      }
    });
  }

  deleteExpense(expense: Expense): void {
    if (!confirm(`¿Eliminar el gasto "${expense.title}" por ${this.currencySymbol} ${expense.amount}?`)) return;

    this.expenseService.deleteExpense(expense.id).subscribe({
      next: () => {
        this.snackBar.open('Gasto eliminado', 'Cerrar', { duration: 2500 });
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Error al eliminar el gasto', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
