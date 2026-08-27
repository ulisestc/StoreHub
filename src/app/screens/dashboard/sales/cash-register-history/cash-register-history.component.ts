import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CashRegisterService, CashRegisterSession } from '../../../../services/cash-register.service';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-cash-register-history',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './cash-register-history.component.html',
  styleUrls: ['./cash-register-history.component.scss']
})
export class CashRegisterHistoryComponent implements OnInit {

  private cashRegisterService = inject(CashRegisterService);
  
  sessions: CashRegisterSession[] = [];
  isLoading = true;
  displayedColumns: string[] = ['opened_at', 'closed_at', 'status', 'opening_balance', 'expected_balance', 'actual_balance', 'difference'];

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    this.cashRegisterService.getSessionsHistory().subscribe({
      next: (data) => {
        // We receive the list directly, but let's handle if it's paginated just in case
        if (data && 'results' in data) {
          this.sessions = (data as any).results;
        } else {
          this.sessions = data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching cash register history', err);
        this.isLoading = false;
      }
    });
  }
}
