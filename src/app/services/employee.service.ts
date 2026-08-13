import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Employee {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly apiUrl = `${environment.apiUrl}/employees/`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `JWT ${token}`
    });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<any>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => response.results || response)
    );
  }

  createEmployee(data: any): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  deactivateEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}/`, { headers: this.getHeaders() });
  }
}
