import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuditLogEntry {
  id: number;
  user: number | null;
  user_name: string;
  user_role: string;
  action: string;
  action_label: string;
  entity: string;
  entity_id: string;
  description: string;
  before_data: Record<string, any> | null;
  after_data: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit-logs/`;

  constructor(private http: HttpClient) {}

  getAuditLogs(filters?: {
    action?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
  }): Observable<AuditLogEntry[]> {
    let params = new HttpParams();
    if (filters?.action) {
      params = params.set('action', filters.action);
    }
    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.start_date) {
      params = params.set('start_date', filters.start_date);
    }
    if (filters?.end_date) {
      params = params.set('end_date', filters.end_date);
    }

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(res => res.results || res || [])
    );
  }
}
