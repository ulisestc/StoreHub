import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { CashRegisterService } from '../../services/cash-register.service';
import { CashRegisterDialogComponent } from '../../components/cash-register-dialog/cash-register-dialog.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cashRegisterService = inject(CashRegisterService);

  userRole: 'Admin' | 'Cajero' | null = null;
  storeName: string | null = null;
  isPremium: boolean = false;

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.storeName = this.authService.getStoreName();
    this.isPremium = this.authService.isPremium();
  }

  openCashRegister(): void {
    this.cashRegisterService.getCurrentSession().subscribe({
      next: (session) => {
        const dialogRef = this.dialog.open(CashRegisterDialogComponent, {
          width: '600px',
          data: { session }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            const action = session ? 'cerrada' : 'abierta';
            this.snackBar.open(`Caja ${action} exitosamente`, 'Cerrar', {
              duration: 3000,
              panelClass: 'success-snackbar'
            });
            // Emit an event or refresh the page if necessary
          }
        });
      },
      error: (err) => {
        console.error('Error fetching current session', err);
        this.snackBar.open('Error al verificar estado de la caja', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
