import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CashRegisterSession {
  id: number;
  opened_at: string;
  closed_at: string | null;
  opening_balance: number;
  expected_closing_balance: number;
  actual_closing_balance: number | null;
  status: 'Open' | 'Closed';
  notes: string;
  opened_by: number;
  closed_by: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class CashRegisterService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/cash-register';

  openSession(opening_balance: number, notes: string = ''): Observable<CashRegisterSession> {
    return this.http.post<CashRegisterSession>(`${this.apiUrl}/open/`, { opening_balance, notes });
  }

  getCurrentSession(): Observable<CashRegisterSession | null> {
    return this.http.get<{session: CashRegisterSession | null}>(`${this.apiUrl}/current/`).pipe(
      map(res => res.session)
    );
  }

  closeSession(id: number, actual_closing_balance: number, notes: string = ''): Observable<CashRegisterSession> {
    // Note: The URL is /api/cash-register/{id}/close/
    return this.http.post<CashRegisterSession>(`${this.apiUrl}/${id}/close/`, { actual_closing_balance, notes });
  }

  getSessionsHistory(page: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    return this.http.get<any>(`${this.apiUrl}/`, { params });
  }
}
