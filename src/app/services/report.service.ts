import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // función para los tres reportews, regresa el html en string
  getReportHtml(endpoint: string, params: any = {}): Observable<string> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.append(key, params[key]);
      }
    });

    return this.http.get(`${this.apiUrl}/reports/${endpoint}/`, {
      params: httpParams,
      responseType: 'text'
    });
  }
}