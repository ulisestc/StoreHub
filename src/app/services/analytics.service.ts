import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardKPI {
  ventas_hoy: number;
  ingresos_hoy: number;
  ticket_promedio: number;
  productos_vendidos_hoy: number;
  ingresos_mes: number;
  ventas_mes: number;
}

export interface SalesOverTime {
  date: string;
  total: number;
  count: number;
}

export interface TopProduct {
  product_name: string;
  product_id: number;
  total_vendido: number;
  revenue: number;
}

export interface SalesByCategory {
  category: string;
  total: number;
  count: number;
}

export interface SalesByHour {
  hour: number;
  total: number;
  count: number;
}

export interface TopSeller {
  seller: string;
  ventas: number;
  monto: number;
}

export interface ProfitabilityItem {
  product_name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

export interface PredictionData {
  historical_trend: string;
  slope: number;
  predictions: { date: string; predicted_total: number }[];
}

export interface PeriodComparison {
  current: { total: number; count: number };
  previous: { total: number; count: number };
  change_percent: number;
}

export interface ChatbotResponse {
  reply: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ Authorization: `JWT ${token}` });
  }

  getDashboardKPI(): Observable<DashboardKPI> {
    return this.http.get<DashboardKPI>(`${this.apiUrl}/analytics/dashboard/`, { headers: this.getHeaders() });
  }

  getSalesOverTime(period: string = 'day', days: number = 30): Observable<SalesOverTime[]> {
    const params = new HttpParams().set('period', period).set('days', days.toString());
    return this.http.get<SalesOverTime[]>(`${this.apiUrl}/analytics/sales-over-time/`, { headers: this.getHeaders(), params });
  }

  getTopProducts(limit: number = 10): Observable<TopProduct[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopProduct[]>(`${this.apiUrl}/analytics/top-products/`, { headers: this.getHeaders(), params });
  }

  getSalesByCategory(): Observable<SalesByCategory[]> {
    return this.http.get<SalesByCategory[]>(`${this.apiUrl}/analytics/sales-by-category/`, { headers: this.getHeaders() });
  }

  getSalesByHour(): Observable<SalesByHour[]> {
    return this.http.get<SalesByHour[]>(`${this.apiUrl}/analytics/sales-by-hour/`, { headers: this.getHeaders() });
  }

  getTopSellers(): Observable<TopSeller[]> {
    return this.http.get<TopSeller[]>(`${this.apiUrl}/analytics/top-sellers/`, { headers: this.getHeaders() });
  }

  getProfitability(): Observable<ProfitabilityItem[]> {
    return this.http.get<ProfitabilityItem[]>(`${this.apiUrl}/analytics/profitability/`, { headers: this.getHeaders() });
  }

  getPredictions(days: number = 30): Observable<PredictionData> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<PredictionData>(`${this.apiUrl}/analytics/predictions/`, { headers: this.getHeaders(), params });
  }

  getComparisons(currentStart: string, currentEnd: string, previousStart: string, previousEnd: string): Observable<PeriodComparison> {
    const params = new HttpParams()
      .set('current_start', currentStart).set('current_end', currentEnd)
      .set('previous_start', previousStart).set('previous_end', previousEnd);
    return this.http.get<PeriodComparison>(`${this.apiUrl}/analytics/comparisons/`, { headers: this.getHeaders(), params });
  }

  sendChatMessage(message: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/analytics/chatbot/`, { message }, { headers: this.getHeaders() });
  }

  upgradeToPremium(): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/store/upgrade/`, {}, { headers: this.getHeaders() });
  }

  cancelPremium(): Observable<any> {
    return this.http.post(`${this.apiUrl}/analytics/store/cancel-premium/`, {}, { headers: this.getHeaders() });
  }
}
