import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Expense {
  id: number;
  store: number;
  user: number;
  user_name: string;
  title: string;
  category: string;
  category_display: string;
  amount: number;
  date: string;
  description?: string;
  created_at: string;
}

export interface ExpenseCategoryBreakdown {
  category: string;
  category_label: string;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  today_total: number;
  today_count: number;
  month_total: number;
  month_count: number;
  by_category: ExpenseCategoryBreakdown[];
}

export interface CreateExpenseData {
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/expenses/`;

  getExpenses(filters?: { category?: string; start_date?: string; end_date?: string; search?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.start_date) params = params.set('start_date', filters.start_date);
    if (filters?.end_date) params = params.set('end_date', filters.end_date);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getSummary(): Observable<ExpenseSummary> {
    return this.http.get<ExpenseSummary>(`${this.apiUrl}summary/`);
  }

  createExpense(data: CreateExpenseData): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, data);
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`);
  }
}
