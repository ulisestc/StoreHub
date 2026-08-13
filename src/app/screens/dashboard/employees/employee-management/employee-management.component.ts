import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Employee, EmployeeService } from '../../../../services/employee.service';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule, MatSnackBarModule
  ],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit {
  employees: Employee[] = [];
  displayedColumns: string[] = ['name', 'email', 'status', 'actions'];
  inviteForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {
    this.inviteForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar empleados', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onInvite(): void {
    if (this.inviteForm.invalid) return;
    
    this.isLoading = true;
    this.employeeService.createEmployee(this.inviteForm.value).subscribe({
      next: (newEmployee) => {
        this.snackBar.open('Empleado invitado. Se ha enviado un correo de activación.', 'Cerrar', { duration: 4000 });
        this.inviteForm.reset();
        this.loadEmployees();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400 && err.error?.non_field_errors) {
          this.snackBar.open(err.error.non_field_errors[0], 'Entendido', { duration: 5000, panelClass: ['error-snackbar'] });
        } else {
          this.snackBar.open('Error al crear empleado', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`¿Estás seguro de ELIMINAR a ${employee.first_name}? Esta acción liberará espacio de tu plan.`)) {
      this.employeeService.deactivateEmployee(employee.id).subscribe({
        next: () => {
          this.snackBar.open('Empleado eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadEmployees();
        },
        error: () => {
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
