import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
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
    MatPaginatorModule,
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

  // Paginación
  totalSessions = 0;
  pageSize = 10;
  currentPage = 0;

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(pageIndex: number = 0): void {
    this.isLoading = true;
    const backendPage = pageIndex + 1;

    this.cashRegisterService.getSessionsHistory(backendPage, this.pageSize).subscribe({
      next: (data) => {
        if (data && 'results' in data) {
          this.sessions = data.results;
          this.totalSessions = data.count;
          this.currentPage = pageIndex;
        } else {
          this.sessions = data;
          this.totalSessions = data.length;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching cash register history', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.loadHistory(event.pageIndex);
  }
}
